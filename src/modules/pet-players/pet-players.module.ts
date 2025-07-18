import { FoodEntity } from '@modules/food/entity/food.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetSpeciesEntity } from '@modules/pet-species/entity/pet-species.entity';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PetPlayersEntity } from './entity/pet-players.entity';
import { PetPlayersController } from './pet-players.controller';
import { PetPlayerservice } from './pet-players.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetPlayersEntity,
      PetSpeciesEntity,
      FoodEntity,
      Inventory,
    ]),
    ClsModule,
    forwardRef(() => UserModule),
  ],
  providers: [PetPlayerservice],
  controllers: [PetPlayersController],
  exports: [PetPlayerservice],
})
export class PetPlayersModule {}
