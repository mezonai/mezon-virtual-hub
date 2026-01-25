import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { ClanDecorInventoryEntity } from './entity/clan-decor-inventory.entity';
import {
  CreateClanDecorInventoryDto,
  ClanDecorInventoryQueryDto,
} from './dto/clan-decor-inventory.dto';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { MapDecorConfigEntity } from '@modules/map-decor-config/entity/map-decor-config.entity';

@Injectable()
export class ClanDecorInventoryService extends BaseService<ClanDecorInventoryEntity> {
  constructor(
    @InjectRepository(ClanDecorInventoryEntity)
    private readonly inventoryRepo: Repository<ClanDecorInventoryEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(DecorItemEntity)
    private readonly decorItemRepo: Repository<DecorItemEntity>,
    @InjectRepository(MapDecorConfigEntity)
    private readonly configRepo: Repository<MapDecorConfigEntity>,
  ) {
    super(inventoryRepo, ClanDecorInventoryEntity.name);
  }

  async getAllClanDecorInventories(query: ClanDecorInventoryQueryDto) {
    const qb = this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.clan', 'clan')
      .leftJoinAndSelect('inventory.decorItem', 'decorItem')
      .orderBy('inventory.created_at', 'DESC');

    if (query.clan_id) {
      qb.andWhere('clan.id = :clan_id', {
        clan_id: query.clan_id,
      });
    }

    return qb.getMany();
  }

  async getClanDecorInventoryById(id: string) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['clan', 'decorItem'],
    });

    if (!inventory) {
      throw new NotFoundException(
        'Clan decor inventory not found',
      );
    }

    return inventory;
  }

  async addDecorItemToClan(dto: CreateClanDecorInventoryDto) {
    const clan = await this.clanRepo.findOne({
      where: { id: dto.clan_id },
    });
    if (!clan) throw new NotFoundException('Clan not found');

    const decorItem = await this.decorItemRepo.findOne({
      where: { id: dto.decor_item_id },
    });
    if (!decorItem) throw new NotFoundException('Decor item not found');

    const inventory = this.inventoryRepo.create({
      clan,
      decorItem,
    });

    try {
      return await this.inventoryRepo.save(inventory);
    } catch (e) {
      throw new BadRequestException(
        'Clan already owns this decor item',
      );
    }
  }

  async removeDecorItemFromClan(id: string) {
    const inventory = await this.getClanDecorInventoryById(id);

    const used = await this.configRepo.exist({
      where: {
        decorItem: { id: inventory.decorItem.id },
        clanEstate: {
          clan: { id: inventory.clan.id },
        },
      },
    });

    if (used) {
      throw new BadRequestException(
        'Cannot remove decor item that is currently placed on map',
      );
    }

    await this.inventoryRepo.remove(inventory);
    return { success: true };
  }
}
