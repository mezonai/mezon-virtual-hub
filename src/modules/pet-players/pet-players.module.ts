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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetPlayersEntity,
      PetsEntity,
      FoodEntity,
      Inventory,
    ]),
    ClsModule,
    PetSkillsModule,
    forwardRef(() => UserModule),
  ],
  providers: [PetPlayersService],
  controllers: [PetPlayersController],
  exports: [PetPlayersService],
})
export class PetPlayersModule {}
