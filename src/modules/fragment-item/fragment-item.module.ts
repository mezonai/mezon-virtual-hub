import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FragmentItemService } from './fragment-item.service';
import { FragmentItemController } from './fragment-item.controller';
import { FragmentItemEntity } from '@modules/fragment-item/entity/fragment-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FragmentItemEntity])],
  controllers: [FragmentItemController],
  providers: [FragmentItemService],
  exports: [FragmentItemService],
})
export class FragmentItemModule {}
