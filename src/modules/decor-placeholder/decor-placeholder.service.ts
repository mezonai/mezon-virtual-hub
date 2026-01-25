import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { DecorPlaceholderEntity } from './entity/decor-placeholder.entity';
import {
  CreateDecorPlaceholderDto,
  DecorPlaceholderQueryDto,
  UpdateDecorPlaceholderDto,
} from './dto/decor-placeholder.dto';
import { MapEntity } from '@modules/map/entity/map.entity';

@Injectable()
export class DecorPlaceholderService extends BaseService<DecorPlaceholderEntity> {
  constructor(
    @InjectRepository(DecorPlaceholderEntity)
    private readonly placeholderRepo: Repository<DecorPlaceholderEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepo: Repository<MapEntity>,
  ) {
    super(placeholderRepo, DecorPlaceholderEntity.name);
  }

  async getAllPlaceholders(query: DecorPlaceholderQueryDto) {
    const qb = this.placeholderRepo
      .createQueryBuilder('ph')
      .leftJoinAndSelect('ph.map', 'map')
      .orderBy('ph.position_index', 'ASC');

    if (query.map_id) {
      qb.where('map.id = :map_id', { map_id: query.map_id });
    }

    return qb.getMany();
  }

  async getPlaceholderById(id: string) {
    const placeholder = await this.placeholderRepo.findOne({
      where: { id },
      relations: ['map', 'configs'],
    });

    if (!placeholder) {
      throw new NotFoundException('Decor placeholder not found');
    }

    return placeholder;
  }

  async createPlaceholder(dto: CreateDecorPlaceholderDto) {
    const map = await this.mapRepo.findOne({
      where: { id: dto.map_id },
    });

    if (!map) {
      throw new BadRequestException('Map not found');
    }

    const existed = await this.placeholderRepo.findOne({
      where: {
        map: { id: dto.map_id },
        code: dto.code,
      },
      relations: ['map'],
    });

    if (existed) {
      throw new BadRequestException(
        'Placeholder code already exists in this map',
      );
    }

    const placeholder = this.placeholderRepo.create({
      map,
      code: dto.code,
      type: dto.type,
      position_index: dto.position_index ?? 1,
      max_items: dto.max_items ?? 1,
    });

    return this.placeholderRepo.save(placeholder);
  }

  async updatePlaceholder(
    id: string,
    dto: UpdateDecorPlaceholderDto,
  ) {
    const placeholder = await this.getPlaceholderById(id);

    if (dto.map_id && dto.map_id !== placeholder.map.id) {
      const map = await this.mapRepo.findOne({
        where: { id: dto.map_id },
      });

      if (!map) {
        throw new BadRequestException('Map not found');
      }

      placeholder.map = map;
    }

    Object.assign(placeholder, dto);
    return this.placeholderRepo.save(placeholder);
  }

  async deletePlaceholder(id: string) {
    const placeholder = await this.getPlaceholderById(id);

    if (placeholder.configs?.length) {
      throw new BadRequestException(
        'Cannot delete placeholder that is already used',
      );
    }

    await this.placeholderRepo.remove(placeholder);
    return { success: true };
  }
}
