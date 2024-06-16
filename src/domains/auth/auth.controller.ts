import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signUp(signUpDto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });

    return { accessToken, refreshToken };
  }

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
    });

    return { accessToken, refreshToken };
  }

  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];

    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });

    return { accessToken };
  }
}
