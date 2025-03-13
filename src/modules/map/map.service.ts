import { BaseService } from '@libs/base/base.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { MapEntity } from './entity/map.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMapDto, MapDtoResponse, UpdateMapDto } from './dto/map.dto';
import { USER_TOKEN } from '@constant';
import { plainToClass, plainToInstance } from 'class-transformer';

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

    return plainToInstance(MapDtoResponse, maps);
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
    const map = await this.mapRepository.findOne({ where: { id } });
    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }

    const filteredData = Object.fromEntries(
      Object.entries(mapData).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    Object.assign(map, filteredData);

    return this.mapRepository.update({ id }, map);
  }

  async deleteMap(id: string) {
    const result = await this.mapRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Map not found');
    }
    return { deleted: true };
  }
}
