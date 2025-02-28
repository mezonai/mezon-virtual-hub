import { BaseService } from '@libs/base/base.service';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { MapEntity } from './entity/map.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MapService extends BaseService<MapEntity> {
  constructor(
    @InjectRepository(MapEntity)
    private readonly mapRepository: Repository<MapEntity>,
    private manager: EntityManager,
  ) {
    super(mapRepository, MapEntity.name);
  }

  async getAllMaps() {
    const maps = await this.find();
    return maps;
  }
}
