import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClanAnimalEntity } from './entity/clan-animal.entity';
import { ClanAnimalsService } from './clan-animals.service';
import { ClanAnimalsController } from './clan-animals.controller';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { PetClanEntity } from '@modules/pet-clan/entity/pet-clan.entity';
import { RecipeModule } from '@modules/recipe/recipe.module';
import { ClanActivityModule } from '@modules/clan-activity/clan-activity.module';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClanAnimalEntity,
      ClanEntity,
      PetClanEntity,
      ClanFundEntity,
      ClanWarehouseEntity,
      RecipeEntity,
    ]),
    RecipeModule,
    ClanActivityModule
  ],
  controllers: [ClanAnimalsController],
  providers: [ClanAnimalsService],
  exports: [ClanAnimalsService],
})
export class ClanAnimalsModule {}
