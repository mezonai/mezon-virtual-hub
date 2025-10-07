import { NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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

  async delete(
    id:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | FindOptionsWhere<T>,
  ): Promise<void> {
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

  async update(
    criteria: string | string[] | number | number[],
    partialEntity: QueryDeepPartialEntity<T>,
  ) {
    return await this.repository.update(criteria, partialEntity);
  }

  async increment(
    conditions: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
  ) {
    return await this.repository.increment(conditions, propertyPath, value);
  }

  async decrement(
    conditions: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
  ) {
    return await this.repository.decrement(conditions, propertyPath, value);
  }

  createQueryBuilder() {
    const alias = this.repository.metadata.tableName;
    return this.repository.createQueryBuilder(alias);
  }
}
