import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/domains/users/entities';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../auth.service';
import {
  LoginRequiredException,
  PermissionDeniedException,
  UserNotFoundException,
} from '../exceptions';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        ConfigService,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            refreshAccessToken: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    authGuard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;

    beforeEach(() => {
      context = {
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {
              accessToken: 'validAccessToken',
              refreshToken: 'validRefreshToken',
            },
          }),
          getResponse: () => ({
            cookie: jest.fn(),
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;
    });

    test('accountType이 지정되지 않은 경우 true를 반환해야 한다', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(undefined);

      const result = await authGuard.canActivate(context);

      expect(result).toBe(true);
    });

    test('accessToken이 없는 경우 LoginRequiredException을 발생시켜야 한다', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce('user');
      context.switchToHttp().getRequest().cookies.accessToken = undefined;

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        LoginRequiredException,
      );
    });

    test('accessToken을 검증하고 accountType이 일치하는 경우 true를 반환해야 한다', async () => {
      const user = { id: 1, email: 'test@example.com' };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce('user');
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce({
        sub: user.email,
        accountType: 'user',
      });
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user as User);
      jest.spyOn(configService, 'get').mockReturnValue('test');

      context.switchToHttp().getRequest().cookies.accessToken =
        'validAccessToken';

      const result = await authGuard.canActivate(context);

      expect(jwtService.verify).toHaveBeenCalledWith('validAccessToken', {
        secret: configService.get('JWT_SECRET'),
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          role: true,
          username: true,
        },
      });
      expect(result).toBe(true);
    });

    test('accountType이 일치하지 않는 경우 PermissionDeniedException을 발생시켜야 한다', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce('admin');
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce({
        sub: 'test@example.com',
        accountType: 'user',
      });

      context.switchToHttp().getRequest().cookies.accessToken =
        'validAccessToken';

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        PermissionDeniedException,
      );
    });

    test('사용자를 찾을 수 없는 경우 UserNotFoundException을 발생시켜야 한다', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce('user');
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce({
        sub: 'test@example.com',
        accountType: 'user',
      });
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      context.switchToHttp().getRequest().cookies.accessToken =
        'validAccessToken';

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
