import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { MapDecorConfigEntity } from './entity/map-decor-config.entity';
import {
  CreateMapDecorConfigDto,
  MapDecorConfigQueryDto,
} from './dto/map-decor-config.dto';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { DecorPlaceholderEntity } from '@modules/decor-placeholder/entity/decor-placeholder.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';

@Injectable()
export class MapDecorConfigService extends BaseService<MapDecorConfigEntity> {
  constructor(
    @InjectRepository(MapDecorConfigEntity)
    private readonly configRepo: Repository<MapDecorConfigEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepo: Repository<MapEntity>,
    @InjectRepository(DecorPlaceholderEntity)
    private readonly placeholderRepo: Repository<DecorPlaceholderEntity>,
    @InjectRepository(DecorItemEntity)
    private readonly decorItemRepo: Repository<DecorItemEntity>,
  ) {
    super(configRepo, MapDecorConfigEntity.name);
  }

  async getAllMapDecorConfigs(query: MapDecorConfigQueryDto) {
    const qb = this.configRepo
      .createQueryBuilder('cfg')
      .leftJoinAndSelect('cfg.clan', 'clan')
      .leftJoinAndSelect('cfg.map', 'map')
      .leftJoinAndSelect('cfg.placeholder', 'placeholder')
      .leftJoinAndSelect('cfg.decorItem', 'decorItem');

    if (query.clan_id) {
      qb.andWhere('clan.id = :clan_id', {
        clan_id: query.clan_id,
      });
    }

    if (query.map_id) {
      qb.andWhere('map.id = :map_id', {
        map_id: query.map_id,
      });
    }

    return qb.getMany();
  }

  async getMapDecorConfigById(id: string) {
    const config = await this.configRepo.findOne({
      where: { id },
      relations: ['clan', 'map', 'placeholder', 'decorItem'],
    });

    if (!config) {
      throw new NotFoundException(
        'Map decor config not found',
      );
    }

    return config;
  }

  async placeDecorItemToPlaceholder(
    dto: CreateMapDecorConfigDto,
  ) {
    const clan = await this.clanRepo.findOne({
      where: { id: dto.clan_id },
    });
    if (!clan) throw new NotFoundException('Clan not found');

    const map = await this.mapRepo.findOne({
      where: { id: dto.map_id },
    });
    if (!map) throw new NotFoundException('Map not found');

    const placeholder = await this.placeholderRepo.findOne({
      where: { id: dto.placeholder_id },
      relations: ['map'],
    });
    if (!placeholder) {
      throw new NotFoundException(
        'Decor placeholder not found',
      );
    }

    if (placeholder.map.id !== map.id) {
      throw new BadRequestException(
        'Placeholder does not belong to this map',
      );
    }

    const decorItem = await this.decorItemRepo.findOne({
      where: { id: dto.decor_item_id },
    });
    if (!decorItem) {
      throw new NotFoundException('Decor item not found');
    }

    // let config = await this.configRepo.findOne({
    //   where: {
    //     clan: { id: dto.clan_id },
    //     placeholder: { id: dto.placeholder_id },
    //   },
    // });

    // if (!config) {
    //   config = this.configRepo.create({
    //     clan,
    //     map,
    //     placeholder,
    //     decorItem,
    //   });
    // } else {
    //   config.decorItem = decorItem;
    // }

    // return this.configRepo.save(config);
  }

  async removeDecorFromPlaceholder(id: string) {
    const config = await this.getMapDecorConfigById(id);
    await this.configRepo.remove(config);
    return { success: true };
  }
}
