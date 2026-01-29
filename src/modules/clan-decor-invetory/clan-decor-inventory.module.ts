import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClanDecorInventoryEntity } from './entity/clan-decor-inventory.entity';
import { ClanDecorInventoryService } from './clan-decor-inventory.service';
import { ClanDecorInventoryController } from './clan-decor-inventory.controller';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapDecorConfigEntity } from '@modules/map-decor-config/entity/map-decor-config.entity';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClanDecorInventoryEntity,
      ClanEntity,
      MapDecorConfigEntity,
      RecipeEntity,
      ClanWarehouseEntity,
      ClanFundEntity,
    ]),
  ],
  controllers: [ClanDecorInventoryController],
  providers: [ClanDecorInventoryService],
  exports: [ClanDecorInventoryService],
})
export class ClanDecorInventoryModule {}
