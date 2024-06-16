import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PRIVATE_DECORATOR_KEY } from '../../common/decorators/private.decorator';
import { TAccount } from '../../common/types';
import { User } from '../users/entities';
import { AuthService } from './auth.service';
import {
  LoginRequiredException,
  PermissionDeniedException,
  UserNotFoundException,
} from './exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accountType = this.reflector.getAllAndOverride<TAccount>(
      PRIVATE_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!accountType) return true;

    const request = context.switchToHttp().getRequest();
    let accessToken = request.cookies.accessToken;

    let decoded: any;

    if (!accessToken) throw new LoginRequiredException();

    try {
      decoded = this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      const refreshToken = request.cookies?.refreshToken;
      if (!refreshToken) {
        throw new LoginRequiredException();
      }
      try {
        const { accessToken: newAccessToken } =
          await this.authService.refreshAccessToken(refreshToken);
        context
          .switchToHttp()
          .getResponse()
          .cookie('accessToken', newAccessToken);
        accessToken = newAccessToken;
        decoded = this.jwtService.verify(accessToken, {
          secret: this.configService.get('JWT_SECRET'),
        });
      } catch (error) {
        console.log(error);
        throw new LoginRequiredException();
      }
    }

    if (!decoded) throw new LoginRequiredException();
    else if (
      (!Array.isArray(accountType) && decoded.accountType !== accountType) ||
      (Array.isArray(accountType) && !accountType.includes(decoded.accountType))
    ) {
      throw new PermissionDeniedException();
    }

    const user = await this.userRepository.findOne({
      where: { email: decoded.sub },
      select: {
        id: true,
        email: true,
        role: true,
        username: true,
      },
    });

    if (!user) throw new UserNotFoundException();

    request.user = user;
    return true;
  }
}
