import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  @IsIn(['google', 'github'])
  provider!: string;

  @IsString()
  code!: string;

  @IsUrl({ require_tld: false })
  redirectUri!: string;

  // CSRF token issued when the authorization URL was generated; verified on callback.
  @IsString()
  @IsNotEmpty()
  state!: string;
}
