import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RoleRepositoryPort } from '../../../domain/ports/role-repository.port';
import { Role } from '../../../domain/models/role.model';
import { RoleEntity } from '../entities/role.entity';
import { RoleMapper } from '../mappers/role.mapper';

const ROLE_RELATIONS = { permissions: true };

@Injectable()
export class TypeOrmRoleRepositoryAdapter implements RoleRepositoryPort {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const entity = await this.roleRepository.findOne({
      where: { id },
      relations: ROLE_RELATIONS,
    });
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.roleRepository.findOne({
      where: { name },
      relations: ROLE_RELATIONS,
    });
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async findDefault(): Promise<Role | null> {
    const entity = await this.roleRepository.findOne({
      where: { isDefault: true },
      relations: ROLE_RELATIONS,
    });
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.roleRepository.find({
      relations: ROLE_RELATIONS,
    });
    return entities.map((e) => RoleMapper.toDomain(e));
  }
}
