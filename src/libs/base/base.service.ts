import { NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral> {
  protected constructor(
    protected readonly repository: Repository<T>,
    private readonly entityName: string,
  ) {}

  create(dto: DeepPartial<T>): T {
    return this.repository.create(dto);
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  async saveAll(entities: T[]): Promise<T[]> {
    return await this.repository.save(entities);
  }

  async find(filter?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(filter);
  }

  async findById(id: number | string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any });
  }

  async findOneNotDeletedById(id: number | string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
    });

    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} ${id?.toString()} does not exist`,
      );
    }

    return entity;
  }

  async delete(id: number | string): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: number | string) {
    const entity = await this.findOneNotDeletedById(id);

    await this.repository.softDelete(entity.id);
  }

  async queryRaw(sql: string, params?: any[]): Promise<any> {
    return this.repository.query(sql, params);
  }

  async findOne(options: FindOneOptions<T>) {
    return await this.repository.findOne(options);
  }
}
