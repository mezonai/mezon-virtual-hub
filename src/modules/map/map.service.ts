import { BaseService } from '@libs/base/base.service';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { MapEntity } from './entity/map.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMapDto, UpdateMapDto } from './dto/map.dto';

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

  async getMapById(id: string) {
    const map = await this.findById(id);
    if (!map) {
      throw new Error('Map not found');
    }
    return map;
  }

  // async createMap(mapData: CreateMapDto) {
  //   const newMap = this.mapRepository.create({
  //     name: mapData.name,
  //     map_key: mapData.map_key,
  //     width: mapData.width,
  //     height: mapData.height,
  //   });
  //   return await this.mapRepository.save(newMap);
  // }

  async updateMap(id: string, mapData: UpdateMapDto) {
    const map = await this.mapRepository.findOne({ where: { id: mapData.id } });
    if (!map) {
      throw new Error('Map not found');
    }
    map.name = mapData.name || '';
    map.width = mapData.width || 0;
    map.height = mapData.height || 0;
    return this.mapRepository.update({ id: mapData.id }, map);
  }

  async deleteMap(id: string) {
    const result = await this.mapRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Map not found');
    }
    return { deleted: true };
  }
}
