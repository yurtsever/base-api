import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// Email Module
import { EmailModule } from '../email/email.module';

// Domain Services
import { AuthDomainService } from './domain/services/auth-domain.service';
import { UserDomainService } from './domain/services/user-domain.service';

// Domain Ports
import { USER_REPOSITORY_PORT } from './domain/ports/user-repository.port';
import { REFRESH_TOKEN_REPOSITORY_PORT } from './domain/ports/refresh-token-repository.port';
import { PASSWORD_HASHER_PORT } from './domain/ports/password-hasher.port';
import { TOKEN_GENERATOR_PORT } from './domain/ports/token-generator.port';
import { ROLE_REPOSITORY_PORT } from './domain/ports/role-repository.port';
import { OTP_REPOSITORY_PORT } from './domain/ports/otp-repository.port';
import { OAUTH_ACCOUNT_REPOSITORY_PORT } from './domain/ports/oauth-account-repository.port';
import { OAUTH_PROVIDER_PORT } from './domain/ports/oauth-provider.port';

// Application Use Case Ports
import { REGISTER_USE_CASE } from './application/ports/register.use-case';
import { LOGIN_USE_CASE } from './application/ports/login.use-case';
import { LOGOUT_USE_CASE } from './application/ports/logout.use-case';
import { REFRESH_TOKEN_USE_CASE } from './application/ports/refresh-token.use-case';
import { GET_PROFILE_USE_CASE } from './application/ports/get-profile.use-case';
import { GET_USERS_USE_CASE } from './application/ports/get-users.use-case';
import { UPDATE_USER_USE_CASE } from './application/ports/update-user.use-case';
import { DELETE_USER_USE_CASE } from './application/ports/delete-user.use-case';
import { REQUEST_OTP_USE_CASE } from './application/ports/request-otp.use-case';
import { VERIFY_OTP_USE_CASE } from './application/ports/verify-otp.use-case';
import { OAUTH_LOGIN_USE_CASE } from './application/ports/oauth-login.use-case';
import { GET_OAUTH_URL_USE_CASE } from './application/ports/get-oauth-url.use-case';

// Application Use Cases
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { RequestOtpUseCase } from './application/use-cases/request-otp.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp.use-case';
import { OAuthLoginUseCase } from './application/use-cases/oauth-login.use-case';
import { GetOAuthUrlUseCase } from './application/use-cases/get-oauth-url.use-case';

// Infrastructure - Persistence
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { PermissionEntity } from './infrastructure/persistence/entities/permission.entity';
import { RefreshTokenEntity } from './infrastructure/persistence/entities/refresh-token.entity';
import { OtpEntity } from './infrastructure/persistence/entities/otp.entity';
import { OAuthAccountEntity } from './infrastructure/persistence/entities/oauth-account.entity';
import { TypeOrmUserRepositoryAdapter } from './infrastructure/persistence/repositories/typeorm-user-repository.adapter';
import { TypeOrmRefreshTokenRepositoryAdapter } from './infrastructure/persistence/repositories/typeorm-refresh-token-repository.adapter';
import { TypeOrmRoleRepositoryAdapter } from './infrastructure/persistence/repositories/typeorm-role-repository.adapter';
import { TypeOrmOtpRepositoryAdapter } from './infrastructure/persistence/repositories/typeorm-otp-repository.adapter';
import { TypeOrmOAuthAccountRepositoryAdapter } from './infrastructure/persistence/repositories/typeorm-oauth-account-repository.adapter';

// Infrastructure - Adapters
import { BcryptPasswordHasherAdapter } from './infrastructure/adapters/bcrypt-password-hasher.adapter';
import { JwtTokenGeneratorAdapter } from './infrastructure/adapters/jwt-token-generator.adapter';
import { OAuthProviderAdapter } from './infrastructure/adapters/oauth-provider.adapter';

// Infrastructure - Strategy & Guards
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';

// Infrastructure - Tasks
import { ExpiredTokenCleanupTask } from './infrastructure/tasks/expired-token-cleanup.task';
import { ExpiredOtpCleanupTask } from './infrastructure/tasks/expired-otp-cleanup.task';

// Controllers
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UserController } from './infrastructure/controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      PermissionEntity,
      RefreshTokenEntity,
      OtpEntity,
      OAuthAccountEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.secret', 'default-dev-secret-change-me'),
        signOptions: {
          expiresIn: configService.get<number>('auth.jwt.accessExpiration', 900),
        },
      }),
    }),
    EmailModule,
  ],
  controllers: [AuthController, UserController],
  providers: [
    // Domain Services
    AuthDomainService,
    UserDomainService,

    // Output Adapters (implementing Domain Ports)
    {
      provide: USER_REPOSITORY_PORT,
      useClass: TypeOrmUserRepositoryAdapter,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY_PORT,
      useClass: TypeOrmRefreshTokenRepositoryAdapter,
    },
    {
      provide: PASSWORD_HASHER_PORT,
      useClass: BcryptPasswordHasherAdapter,
    },
    {
      provide: TOKEN_GENERATOR_PORT,
      useClass: JwtTokenGeneratorAdapter,
    },
    {
      provide: ROLE_REPOSITORY_PORT,
      useClass: TypeOrmRoleRepositoryAdapter,
    },
    {
      provide: OTP_REPOSITORY_PORT,
      useClass: TypeOrmOtpRepositoryAdapter,
    },
    {
      provide: OAUTH_ACCOUNT_REPOSITORY_PORT,
      useClass: TypeOrmOAuthAccountRepositoryAdapter,
    },
    {
      provide: OAUTH_PROVIDER_PORT,
      useClass: OAuthProviderAdapter,
    },

    // Use Cases (Input Ports)
    { provide: REGISTER_USE_CASE, useClass: RegisterUseCase },
    { provide: LOGIN_USE_CASE, useClass: LoginUseCase },
    { provide: LOGOUT_USE_CASE, useClass: LogoutUseCase },
    { provide: REFRESH_TOKEN_USE_CASE, useClass: RefreshTokenUseCase },
    { provide: GET_PROFILE_USE_CASE, useClass: GetProfileUseCase },
    { provide: GET_USERS_USE_CASE, useClass: GetUsersUseCase },
    { provide: UPDATE_USER_USE_CASE, useClass: UpdateUserUseCase },
    { provide: DELETE_USER_USE_CASE, useClass: DeleteUserUseCase },
    { provide: REQUEST_OTP_USE_CASE, useClass: RequestOtpUseCase },
    { provide: VERIFY_OTP_USE_CASE, useClass: VerifyOtpUseCase },
    { provide: OAUTH_LOGIN_USE_CASE, useClass: OAuthLoginUseCase },
    { provide: GET_OAUTH_URL_USE_CASE, useClass: GetOAuthUrlUseCase },

    // Tasks
    ExpiredTokenCleanupTask,
    ExpiredOtpCleanupTask,

    // Strategy & Guards
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [JwtAuthGuard, RolesGuard, PermissionsGuard, USER_REPOSITORY_PORT],
})
export class IamModule {}
