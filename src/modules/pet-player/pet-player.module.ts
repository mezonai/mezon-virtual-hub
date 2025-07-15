import { FoodEntity } from '@modules/food/entity/food.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetSpeciesEntity } from '@modules/pet-species/entity/pet-species.entity';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PetPlayerEntity } from './entity/pet-player.entity';
import { PetPlayerController } from './pet-player.controller';
import { PetPlayerService } from './pet-player.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PetPlayerEntity,
      PetSpeciesEntity,
      FoodEntity,
      Inventory,
    ]),
    ClsModule,
    forwardRef(() => UserModule),
  ],
  providers: [PetPlayerService],
  controllers: [PetPlayerController],
  exports: [PetPlayerService],
})
export class PetPlayerModule {}
