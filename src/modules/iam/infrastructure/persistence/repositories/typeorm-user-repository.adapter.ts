import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { PaginatedResult, PaginationOptions } from '../../../../../shared/application/interfaces';
import type { UserRepositoryPort } from '../../../domain/ports/user-repository.port';
import { User } from '../../../domain/models/user.model';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserMapper } from '../mappers/user.mapper';

const USER_RELATIONS = { roles: { permissions: true } };

@Injectable()
export class TypeOrmUserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({
      where: { id },
      relations: USER_RELATIONS,
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({
      where: { email },
      relations: USER_RELATIONS,
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<User> {
    const entity = UserMapper.toEntity(user);

    if (user.roles.length > 0) {
      const roleIds = user.roles.map((r) => r.id);
      entity.roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
        relations: { permissions: true },
      });
    }

    const saved = await this.userRepository.save(entity);
    return UserMapper.toDomain(saved);
  }

  async update(user: User): Promise<User> {
    const entity = UserMapper.toEntity(user);

    if (user.roles.length > 0) {
      const roleIds = user.roles.map((r) => r.id);
      entity.roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
        relations: { permissions: true },
      });
    }

    const saved = await this.userRepository.save(entity);
    return UserMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<User>> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;

    const [entities, total] = await this.userRepository.findAndCount({
      relations: USER_RELATIONS,
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return {
      items: entities.map((e) => UserMapper.toDomain(e)),
      meta: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  }
}
