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
import { DecorPlaceholderEntity } from '@modules/decor-placeholder/entity/decor-placeholder.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { ClanEstateEntity } from '@modules/clan-estate/entity/clan-estate.entity';
import { ClanDecorInventoryEntity } from '@modules/clan-decor-invetory/entity/clan-decor-inventory.entity';

@Injectable()
export class MapDecorConfigService extends BaseService<MapDecorConfigEntity> {
  constructor(
    @InjectRepository(MapDecorConfigEntity)
    private readonly configRepo: Repository<MapDecorConfigEntity>,
    @InjectRepository(DecorPlaceholderEntity)
    private readonly placeholderRepo: Repository<DecorPlaceholderEntity>,
    @InjectRepository(DecorItemEntity)
    private readonly decorItemRepo: Repository<DecorItemEntity>,
    @InjectRepository(ClanEstateEntity)
    private readonly clanEstateRepo: Repository<ClanEstateEntity>,
    @InjectRepository(ClanDecorInventoryEntity)
    private readonly clanInventoryRepo: Repository<ClanDecorInventoryEntity>,
  ) {
    super(configRepo, MapDecorConfigEntity.name);
  }

  async getAllMapDecorConfigs(query: MapDecorConfigQueryDto) {
    const qb = this.configRepo
      .createQueryBuilder('cfg')
      .leftJoinAndSelect('cfg.clanEstate', 'clanEstate')
      .leftJoinAndSelect('cfg.placeholder', 'placeholder')
      .leftJoinAndSelect('cfg.decorItem', 'decorItem');

    if (query.clan_estate_id) {
      qb.andWhere('clanEstate.id = :id', {
        id: query.clan_estate_id,
      });
    }

    return qb.getMany();
  }

  async getMapDecorConfigById(id: string) {
    const config = await this.configRepo.findOne({
      where: { id },
      relations: ['clanEstate', 'placeholder', 'decorItem'],
    });

    if (!config) {
      throw new NotFoundException('Map decor config not found');
    }

    return config;
  }

  async placeDecorItemToPlaceholder(dto: CreateMapDecorConfigDto) {
    const clanEstate = await this.clanEstateRepo.findOne({
      where: { id: dto.clan_estate_id },
      relations: ['clan', 'realEstate'],
    });

    if (!clanEstate) {
      throw new NotFoundException('Clan estate not found');
    }

    const placeholder = await this.placeholderRepo.findOne({
      where: { id: dto.placeholder_id },
      relations: ['map'],
    });

    if (!placeholder) {
      throw new NotFoundException('Decor placeholder not found');
    }

    if (placeholder.map.id !== clanEstate.realEstate.id) {
      throw new BadRequestException('Placeholder does not belong to this clan estate map');
    }

    const decorItem = await this.decorItemRepo.findOne({
      where: { id: dto.decor_item_id },
    });

    if (!decorItem) {
      throw new NotFoundException('Decor item not found');
    }

    const ownedInventory = await this.clanInventoryRepo.findOne({
      where: {
        clan: { id: clanEstate.clan.id },
        decorItem: { id: decorItem.id },
      },
    });

    if (!ownedInventory) {
      throw new BadRequestException('Clan does not own this decor item');
    }

    if (decorItem.type !== placeholder.type) {
      throw new BadRequestException('Decor item type does not match placeholder type');
    }

    const usedItem = await this.configRepo.findOne({
      where: { decorItem: { id: decorItem.id } },
    });

    if (usedItem) throw new BadRequestException('Decor item is already placed');

    let config = await this.configRepo.findOne({
      where: {
        clanEstate: { id: dto.clan_estate_id },
        placeholder: { id: dto.placeholder_id },
      },
    });

    if (!config) {
      config = this.configRepo.create({
        clanEstate,
        placeholder,
        decorItem,
      });
    } else {
      config.decorItem = decorItem;
    }

    return this.configRepo.save(config);
  }

  async removeDecorFromPlaceholder(id: string) {
    const config = await this.getMapDecorConfigById(id);
    await this.configRepo.softRemove(config);
    return { success: true };
  }
}
