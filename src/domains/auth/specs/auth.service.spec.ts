import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/domains/users/entities';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { SignInDto, SignUpDto } from '../dto';
import { RefreshToken } from '../entities';
import {
  EmailOrPasswordMismatchException,
  InvalidTokenSignatureException,
  TokenExpiredException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../exceptions';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let refreshTokenRepository: Repository<RefreshToken>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'secret';
              } else if (key === 'JWT_ACCESS_TOKEN_EXPIRES_IN') {
                return '1m';
              } else if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') {
                return '7d';
              } else if (key === 'BCRYPT_SALT_ROUNDS') {
                return '10';
              }
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'token'),
            verify: jest.fn(() => ({ exp: Date.now() / 1000 + 3600 })),
            verifyAsync: jest.fn(() =>
              Promise.resolve({
                sub: 'test@example.com',
                exp: Date.now() / 1000 + 3600,
              }),
            ),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn((user: Partial<User>) => user),
            save: jest.fn((user: User) => Promise.resolve(user)),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOne: jest.fn(),
            upsert: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('signUp', () => {
    test('새로운 사용자를 생성하고 토큰을 반환해야 한다', async () => {
      const signUpDto: SignUpDto = {
        username: '테스트유저',
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('hashedPassword' as never);
      jest.spyOn(userRepository, 'create').mockReturnValueOnce({
        ...signUpDto,
        password: 'hashedPassword',
      } as User);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
        id: 1,
        ...signUpDto,
        password: 'hashedPassword',
      } as User);
      jest
        .spyOn(refreshTokenRepository, 'upsert')
        .mockResolvedValueOnce(undefined);

      const result = await authService.signUp(signUpDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        signUpDto.password,
        parseInt(configService.get('BCRYPT_SALT_ROUNDS')),
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        ...signUpDto,
        password: 'hashedPassword',
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...signUpDto,
        password: 'hashedPassword',
      });
      expect(refreshTokenRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          expiresAt: expect.any(Date),
          user: { id: 1 },
        }),
        { conflictPaths: ['userId'] },
      );
      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    test('사용자가 이미 존재하는 경우 UserAlreadyExistsException을 발생시켜야 한다', async () => {
      const signUpDto: SignUpDto = {
        username: '테스트유저',
        email: 'test@example.com',
        password: 'password',
      };
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(signUpDto as User);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('signIn', () => {
    test('사용자 자격 증명을 검증하고 토큰을 반환해야 한다', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, ...signInDto, password: 'hashedPassword' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
      jest
        .spyOn(refreshTokenRepository, 'upsert')
        .mockResolvedValueOnce(undefined);

      const result = await authService.signIn(signInDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        user.password,
      );
      expect(refreshTokenRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          expiresAt: expect.any(Date),
          user: { id: 1 },
        }),
        { conflictPaths: ['userId'] },
      );
      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    test('사용자가 존재하지 않는 경우 EmailOrPasswordMismatchException을 발생시켜야 한다', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        EmailOrPasswordMismatchException,
      );
    });

    test('비밀번호가 유효하지 않은 경우 EmailOrPasswordMismatchException을 발생시켜야 한다', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, ...signInDto, password: 'hashedPassword' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        EmailOrPasswordMismatchException,
      );
    });
  });
  describe('refreshAccessToken', () => {
    test('리프레시 토큰이 유효한 경우 액세스 토큰을 갱신해야 한다', async () => {
      const refreshToken = 'validRefreshToken';
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
        sub: user.email,
        exp: Date.now() / 1000 + 3600,
      });
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockResolvedValueOnce({ token: refreshToken } as RefreshToken);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user as User);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: configService.get('JWT_SECRET'),
      });
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(result).toEqual({
        accessToken: expect.any(String),
      });
    });

    test('리프레시 토큰이 유효하지 않은 경우 InvalidTokenSignatureException을 발생시켜야 한다', async () => {
      const refreshToken = 'invalidRefreshToken';
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('invalid token'));

      await expect(
        authService.refreshAccessToken(refreshToken),
      ).rejects.toThrow(InvalidTokenSignatureException);
    });

    test('리프레시 토큰이 만료된 경우 TokenExpiredException을 발생시켜야 한다', async () => {
      const refreshToken = 'expiredRefreshToken';
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
        sub: 'test@example.com',
        exp: Date.now() / 1000 - 3600,
      });

      await expect(
        authService.refreshAccessToken(refreshToken),
      ).rejects.toThrow(TokenExpiredException);
    });

    test('리프레시 토큰이 존재하지 않는 경우 InvalidTokenSignatureException을 발생시켜야 한다', async () => {
      const refreshToken = 'nonExistentRefreshToken';
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
        sub: 'test@example.com',
        exp: Date.now() / 1000 + 3600,
      });
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      await expect(
        authService.refreshAccessToken(refreshToken),
      ).rejects.toThrow(InvalidTokenSignatureException);
    });
  });

  describe('validateRefreshToken', () => {
    test('리프레시 토큰을 검증하고 토큰이 유효한 경우 페이로드를 반환해야 한다', async () => {
      const refreshToken = 'validRefreshToken';
      const payload = {
        sub: 'test@example.com',
        exp: Date.now() / 1000 + 3600,
      };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(payload);
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockResolvedValueOnce({ token: refreshToken } as RefreshToken);

      const result = await authService.validateRefreshToken(refreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: configService.get('JWT_SECRET'),
      });
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
      expect(result).toEqual(payload);
    });

    test('리프레시 토큰이 유효하지 않은 경우 InvalidTokenSignatureException을 발생시켜야 한다', async () => {
      const refreshToken = 'invalidRefreshToken';
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('invalid token'));

      await expect(
        authService.validateRefreshToken(refreshToken),
      ).rejects.toThrow(InvalidTokenSignatureException);
    });

    test('리프레시 토큰이 만료된 경우 TokenExpiredException을 발생시켜야 한다', async () => {
      const refreshToken = 'expiredRefreshToken';
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
        sub: 'test@example.com',
        exp: Date.now() / 1000 - 3600,
      });

      await expect(
        authService.validateRefreshToken(refreshToken),
      ).rejects.toThrow(TokenExpiredException);
    });

    test('리프레시 토큰이 존재하지 않는 경우 InvalidTokenSignatureException을 발생시켜야 한다', async () => {
      const refreshToken = 'nonExistentRefreshToken';
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({
        sub: 'test@example.com',
        exp: Date.now() / 1000 + 3600,
      });
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      await expect(
        authService.validateRefreshToken(refreshToken),
      ).rejects.toThrow(InvalidTokenSignatureException);
    });
  });

  describe('findUserByEmail', () => {
    test('이메일로 사용자를 찾고 사용자가 존재하는 경우 사용자를 반환해야 한다', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email, password: 'hashedPassword' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user as User);

      const result = await authService.findUserByEmail(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });

    test('사용자가 존재하지 않는 경우 UserNotFoundException을 발생시켜야 한다', async () => {
      const email = 'nonexistent@example.com';
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(authService.findUserByEmail(email)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
