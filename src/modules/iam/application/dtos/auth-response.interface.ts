export interface PermissionJson {
  id: string;
  resource: string;
  action: string;
  description: string;
  slug: string;
}

export interface RoleJson {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: PermissionJson[];
}

export interface UserJson {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  roles: RoleJson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: UserJson;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthCookieResponse {
  user: UserJson;
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}
