import { FoodEntity } from '@modules/food/entity/food.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PetPlayersEntity } from './entity/pet-players.entity';
import { PetPlayersController } from './pet-players.controller';
import { PetPlayersService } from './pet-players.service';
import { PetSkillsModule } from '@modules/pet-skills/pet-skills.module';
import { PetSkillUsageEntity } from '@modules/pet-skill-usages/entity/pet-skill-usages.entity';
import { PetSpawnCronJob } from '@modules/pet-players/pet-players.cronjob';
import { NumberRarityModule } from '@modules/number-rarity/number-rarity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetPlayersEntity,
      PetsEntity,
      FoodEntity,
      Inventory,
      PetSkillUsageEntity,
    ]),
    ClsModule,
    PetSkillsModule,
    forwardRef(() => UserModule),
    NumberRarityModule,
  ],
  providers: [PetPlayersService, PetSpawnCronJob],
  controllers: [PetPlayersController],
  exports: [PetPlayersService],
})
export class PetPlayersModule {}
