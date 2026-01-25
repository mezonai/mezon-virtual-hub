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

  async getAllMaps() {
    const qb = this.mapRepo.createQueryBuilder('map');

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

    const existedIndex = await this.mapRepo.findOne({
      where: { index: dto.index },
    });

    if (existedIndex) {
      throw new BadRequestException('Map index already exists');
    }

    const map = this.mapRepo.create(dto);
    return this.mapRepo.save(map);
  }

  async updateMap(id: string, dto: UpdateMapDto) {
    const map = await this.getMapById(id);

    if (dto.index !== undefined && dto.index !== map.index) {
      const existedIndex = await this.mapRepo.findOne({
        where: { index: dto.index },
      });

      if (existedIndex) {
        throw new BadRequestException('Map index already exists');
      }
    }

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
