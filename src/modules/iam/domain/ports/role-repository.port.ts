import { Role } from '../models/role.model';

export interface RoleRepositoryPort {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findDefault(): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}

export const ROLE_REPOSITORY_PORT = Symbol('ROLE_REPOSITORY_PORT');
