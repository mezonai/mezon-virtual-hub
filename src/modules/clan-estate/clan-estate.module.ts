import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClanEstateEntity } from './entity/clan-estate.entity';
import { ClanEstateService } from './clan-estate.service';
import { ClanEstateController } from './clan-estate.controller';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClanEstateEntity,
      ClanEntity,
      MapEntity,
      RecipeEntity,
      ClanFundEntity,
      ClanWarehouseEntity,
    ]),
  ],
  controllers: [ClanEstateController],
  providers: [ClanEstateService],
  exports: [ClanEstateService],
})
export class ClanEstateModule {}
