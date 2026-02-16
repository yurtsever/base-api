import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { RegisterDto } from '../../application/dtos/register.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RequestOtpDto } from '../../application/dtos/request-otp.dto';
import { VerifyOtpDto } from '../../application/dtos/verify-otp.dto';
import type { AuthCookieResponse } from '../../application/dtos/auth-response.interface';
import type { RegisterUseCasePort } from '../../application/ports/register.use-case';
import { REGISTER_USE_CASE } from '../../application/ports/register.use-case';
import type { LoginUseCasePort } from '../../application/ports/login.use-case';
import { LOGIN_USE_CASE } from '../../application/ports/login.use-case';
import type { LogoutUseCasePort } from '../../application/ports/logout.use-case';
import { LOGOUT_USE_CASE } from '../../application/ports/logout.use-case';
import type { RefreshTokenUseCasePort } from '../../application/ports/refresh-token.use-case';
import { REFRESH_TOKEN_USE_CASE } from '../../application/ports/refresh-token.use-case';
import type { RequestOtpUseCasePort } from '../../application/ports/request-otp.use-case';
import { REQUEST_OTP_USE_CASE } from '../../application/ports/request-otp.use-case';
import type { VerifyOtpUseCasePort } from '../../application/ports/verify-otp.use-case';
import { VERIFY_OTP_USE_CASE } from '../../application/ports/verify-otp.use-case';
import { OAuthCallbackDto } from '../../application/dtos/oauth-callback.dto';
import type { OAuthLoginUseCasePort } from '../../application/ports/oauth-login.use-case';
import { OAUTH_LOGIN_USE_CASE } from '../../application/ports/oauth-login.use-case';
import type { GetOAuthUrlUseCasePort } from '../../application/ports/get-oauth-url.use-case';
import { GET_OAUTH_URL_USE_CASE } from '../../application/ports/get-oauth-url.use-case';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(REGISTER_USE_CASE)
    private readonly registerUseCase: RegisterUseCasePort,
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCasePort,
    @Inject(LOGOUT_USE_CASE)
    private readonly logoutUseCase: LogoutUseCasePort,
    @Inject(REFRESH_TOKEN_USE_CASE)
    private readonly refreshTokenUseCase: RefreshTokenUseCasePort,
    @Inject(REQUEST_OTP_USE_CASE)
    private readonly requestOtpUseCase: RequestOtpUseCasePort,
    @Inject(VERIFY_OTP_USE_CASE)
    private readonly verifyOtpUseCase: VerifyOtpUseCasePort,
    @Inject(GET_OAUTH_URL_USE_CASE)
    private readonly getOAuthUrlUseCase: GetOAuthUrlUseCasePort,
    @Inject(OAUTH_LOGIN_USE_CASE)
    private readonly oauthLoginUseCase: OAuthLoginUseCasePort,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<AuthCookieResponse> {
    const result = await this.registerUseCase.execute(dto);

    setRefreshTokenCookie(res, this.configService, {
      refreshToken: result.refreshToken,
      refreshExpiresIn: this.configService.get<number>('auth.jwt.refreshExpiration', 604800),
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthCookieResponse> {
    const result = await this.loginUseCase.execute(dto);

    setRefreshTokenCookie(res, this.configService, {
      refreshToken: result.refreshToken,
      refreshExpiresIn: this.configService.get<number>('auth.jwt.refreshExpiration', 604800),
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
    };
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken: string | undefined = cookies?.refresh_token || dto.refreshToken;
    if (refreshToken) {
      await this.logoutUseCase.execute({ refreshToken });
    }

    clearRefreshTokenCookie(res, this.configService);

    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthCookieResponse> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken: string | undefined = cookies?.refresh_token || dto.refreshToken;
    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    setRefreshTokenCookie(res, this.configService, {
      refreshToken: result.refreshToken,
      refreshExpiresIn: this.configService.get<number>('auth.jwt.refreshExpiration', 604800),
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
    };
  }

  @Post('otp/request')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a one-time password via email' })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ message: string }> {
    return this.requestOtpUseCase.execute(dto);
  }

  @Post('otp/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and authenticate' })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response): Promise<AuthCookieResponse> {
    const result = await this.verifyOtpUseCase.execute(dto);

    setRefreshTokenCookie(res, this.configService, {
      refreshToken: result.refreshToken,
      refreshExpiresIn: this.configService.get<number>('auth.jwt.refreshExpiration', 604800),
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
    };
  }

  @Get('oauth/:provider/url')
  @Public()
  @ApiOperation({ summary: 'Get OAuth authorization URL for a provider' })
  getOAuthUrl(
    @Param('provider') provider: string,
    @Query('redirectUri') redirectUri: string,
  ): { url: string; state: string } {
    return this.getOAuthUrlUseCase.execute(provider, redirectUri);
  }

  @Post('oauth/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange OAuth code for authentication tokens' })
  async oauthCallback(
    @Body() dto: OAuthCallbackDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthCookieResponse & { isNewUser: boolean }> {
    const result = await this.oauthLoginUseCase.execute(dto);

    setRefreshTokenCookie(res, this.configService, {
      refreshToken: result.refreshToken,
      refreshExpiresIn: this.configService.get<number>('auth.jwt.refreshExpiration', 604800),
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      tokenType: result.tokenType,
      isNewUser: result.isNewUser,
    };
  }
}
