import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AnimalEntity } from './entity/animal.entity';
import { AnimalController } from './animal.controller';
import { AnimalService } from './animal.service';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnimalEntity, FoodEntity, Inventory]),
    ClsModule,
    forwardRef(() => UserModule),
  ],
  providers: [AnimalService],
  controllers: [AnimalController],
  exports: [AnimalService],
})
export class AnimalModule {}
