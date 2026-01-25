import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { MapEntity } from './entity/map.entity';
import {
  CreateMapDto,
  MapQueryDto,
  UpdateMapDto,
} from './dto/map.dto';

@Injectable()
export class MapService extends BaseService<MapEntity> {
  constructor(
    @InjectRepository(MapEntity)
    private readonly mapRepo: Repository<MapEntity>,
  ) {
    super(mapRepo, MapEntity.name);
  }

  async getAllMaps(query: MapQueryDto) {
    const qb = this.mapRepo.createQueryBuilder('map');

    if (query.is_locked !== undefined) {
      qb.where('map.is_locked = :is_locked', {
        is_locked: query.is_locked,
      });
    }

    qb.orderBy('map.index', 'ASC');

    return qb.getMany();
  }

  async getMapById(id: string) {
    const map = await this.mapRepo.findOne({
      where: { id },
      relations: ['clanEstates'],
    });

    if (!map) {
      throw new NotFoundException('Map not found');
    }

    return map;
  }

  async createMap(dto: CreateMapDto) {
    const existed = await this.mapRepo.findOne({
      where: { name: dto.name },
    });

    if (existed) {
      throw new BadRequestException(
        'Map name already exists',
      );
    }

    const map = this.mapRepo.create(dto);
    return this.mapRepo.save(map);
  }

  async updateMap(id: string, dto: UpdateMapDto) {
    const map = await this.getMapById(id);
    Object.assign(map, dto);
    return this.mapRepo.save(map);
  }

  async deleteMap(id: string) {
    const map = await this.getMapById(id);

    if (map.clanEstates?.length) {
      throw new BadRequestException(
        'Cannot delete map that is owned by clans',
      );
    }

    await this.mapRepo.remove(map);
    return { success: true };
  }
}
