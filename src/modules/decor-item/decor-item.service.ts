import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { DecorItemEntity } from './entity/decor-item.entity';
import {
  CreateDecorItemDto,
  DecorItemQueryDto,
  UpdateDecorItemDto,
} from './dto/decor-item.dto';

@Injectable()
export class DecorItemService extends BaseService<DecorItemEntity> {
  constructor(
    @InjectRepository(DecorItemEntity)
    private readonly decorItemRepo: Repository<DecorItemEntity>,
  ) {
    super(decorItemRepo, DecorItemEntity.name);
  }

  async getAllDecorItems(query: DecorItemQueryDto) {
    const qb = this.decorItemRepo.createQueryBuilder('decor');

    if (query.type) {
      qb.where('decor.type = :type', { type: query.type });
    }

    qb.orderBy('decor.created_at', 'DESC');

    return qb.getMany();
  }

  async getDecorItemById(id: string) {
    const decor = await this.decorItemRepo.findOne({
      where: { id },
      relations: ['inventories', 'mapConfigs'],
    });

    if (!decor) {
      throw new NotFoundException('Decor item not found');
    }

    return decor;
  }

  async createDecorItem(dto: CreateDecorItemDto) {
    const exists = await this.decorItemRepo.findOne({
      where: {
        type: dto.type,
        name: dto.name,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Decor item already exists',
      );
    }

    const decor = this.decorItemRepo.create(dto);
    return this.decorItemRepo.save(decor);
  }

  async updateDecorItem(id: string, dto: UpdateDecorItemDto) {
    const decor = await this.getDecorItemById(id);

    if (dto.type && decor.mapConfigs?.length) {
      throw new BadRequestException(
        'Cannot change type of decor item already used on map',
      );
    }

    Object.assign(decor, dto);
    return this.decorItemRepo.save(decor);
  }

  async deleteDecorItem(id: string) {
    const decor = await this.getDecorItemById(id);

    if (decor.inventories?.length) {
      throw new BadRequestException(
        'Cannot delete decor item in clan inventory',
      );
    }

    if (decor.mapConfigs?.length) {
      throw new BadRequestException(
        'Cannot delete decor item used in map config',
      );
    }

    await this.decorItemRepo.remove(decor);
    return { success: true };
  }
}
