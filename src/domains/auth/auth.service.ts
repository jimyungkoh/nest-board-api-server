import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SignInDto, SignUpDto } from './dto';
import { RefreshToken } from './entities/refresh-token.entity';
import {
  EmailOrPasswordMismatchException,
  InvalidTokenSignatureException,
  TokenExpiredException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from './exceptions';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    await this.validateUserDoesNotExist(signUpDto.email);
    const createdUser = await this.createUser(signUpDto);
    return this.createTokens(createdUser);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.validateUserCredentials(signInDto);
    return this.createTokens(user);
  }

  async refreshAccessToken(refreshToken: string) {
    const { sub } = await this.validateRefreshToken(refreshToken);
    const user = await this.findUserByEmail(sub);
    return await this.createAccessToken(user);
  }

  private async validateUserDoesNotExist(email: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }
  }

  private async createUser(signUpDto: SignUpDto) {
    const { password, ...userData } = signUpDto;
    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepository.create({
      password: hashedPassword,
      ...userData,
    });
    return this.userRepository.save(user);
  }

  private async validateUserCredentials(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new EmailOrPasswordMismatchException();
    }
    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new EmailOrPasswordMismatchException();
    }
    return user;
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const { sub, exp } = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      this.validateTokenExpiration(exp);
      await this.validateRefreshTokenExists(refreshToken);
      return { sub, exp };
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        throw new TokenExpiredException();
      } else {
        throw new InvalidTokenSignatureException();
      }
    }
  }

  private validateTokenExpiration(exp: number) {
    if (exp * 1000 < Date.now()) {
      throw new TokenExpiredException();
    }
  }

  private async validateRefreshTokenExists(refreshToken: string) {
    const foundRefreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });
    if (!foundRefreshToken) {
      throw new InvalidTokenSignatureException();
    }
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  private async createAccessToken(user: User) {
    const accessToken = await this.createToken(
      user,
      this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    );
    return { accessToken };
  }

  private async createTokens(user: User) {
    const [refreshToken, accessToken] = await Promise.all([
      this.createToken(
        user,
        this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      ),
      this.createToken(
        user,
        this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      ),
    ]);
    await this.saveRefreshToken(user, refreshToken);
    return { refreshToken, accessToken };
  }

  private async createToken(user: User, expiresIn: string) {
    return this.jwtService.sign(
      { sub: user.email, accountType: user.role },
      { expiresIn },
    );
  }

  private async saveRefreshToken(user: User, token: string) {
    const { exp } = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
    const expiresAt = new Date(exp * 1000);
    await this.refreshTokenRepository.upsert(
      { token, expiresAt, user: { id: user.id } },
      { conflictPaths: ['userId'] },
    );
  }

  private async hashPassword(password: string) {
    const bcryptSaltRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS'),
    );
    return await bcrypt.hash(password, bcryptSaltRounds);
  }

  private async comparePasswords(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
