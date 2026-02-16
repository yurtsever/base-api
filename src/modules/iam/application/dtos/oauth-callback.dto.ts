import { IsIn, IsString, IsUrl } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  @IsIn(['google', 'github'])
  provider!: string;

  @IsString()
  code!: string;

  @IsUrl({ require_tld: false })
  redirectUri!: string;
}
