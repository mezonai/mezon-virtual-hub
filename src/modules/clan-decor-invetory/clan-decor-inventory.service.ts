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

@Injectable()
export class ClanDecorInventoryService extends BaseService<ClanDecorInventoryEntity> {
  constructor(
    @InjectRepository(ClanDecorInventoryEntity)
    private readonly inventoryRepo: Repository<ClanDecorInventoryEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(DecorItemEntity)
    private readonly decorItemRepo: Repository<DecorItemEntity>,
  ) {
    super(inventoryRepo, ClanDecorInventoryEntity.name);
  }

  async getAllClanDecorInventories(
    query: ClanDecorInventoryQueryDto,
  ) {
    const qb = this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.clan', 'clan')
      .leftJoinAndSelect('inventory.decorItem', 'decorItem');

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

  async addDecorItemToClan(
    dto: CreateClanDecorInventoryDto,
  ) {
    const clan = await this.clanRepo.findOne({
      where: { id: dto.clan_id },
    });
    if (!clan) {
      throw new NotFoundException('Clan not found');
    }

    const decorItem = await this.decorItemRepo.findOne({
      where: { id: dto.decor_item_id },
    });
    if (!decorItem) {
      throw new NotFoundException('Decor item not found');
    }

    const existed = await this.inventoryRepo.findOne({
      where: {
        clan: { id: dto.clan_id },
        decorItem: { id: dto.decor_item_id },
      },
    });

    if (existed) {
      throw new BadRequestException(
        'Clan already owns this decor item',
      );
    }

    const inventory = this.inventoryRepo.create({
      clan,
      decorItem,
    });

    return this.inventoryRepo.save(inventory);
  }

  async removeDecorItemFromClan(id: string) {
    const inventory = await this.getClanDecorInventoryById(id);
    await this.inventoryRepo.remove(inventory);
    return { success: true };
  }
}
