import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class LinkOAuthAccountDto {
  @IsString()
  @IsIn(['google', 'github'])
  provider!: string;

  @IsString()
  code!: string;

  @IsUrl({ require_tld: false })
  redirectUri!: string;

  // CSRF token issued by the authenticated link-url endpoint; bound to the current user.
  @IsString()
  @IsNotEmpty()
  state!: string;
}
