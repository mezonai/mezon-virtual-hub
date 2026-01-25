import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClanDecorInventoryEntity } from './entity/clan-decor-inventory.entity';
import { ClanDecorInventoryService } from './clan-decor-inventory.service';
import { ClanDecorInventoryController } from './clan-decor-inventory.controller';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { MapDecorConfigEntity } from '@modules/map-decor-config/entity/map-decor-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClanDecorInventoryEntity,
      ClanEntity,
      DecorItemEntity,
      MapDecorConfigEntity,
    ]),
  ],
  controllers: [ClanDecorInventoryController],
  providers: [ClanDecorInventoryService],
  exports: [ClanDecorInventoryService],
})
export class ClanDecorInventoryModule {}
