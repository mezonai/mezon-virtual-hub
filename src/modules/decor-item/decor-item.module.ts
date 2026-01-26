import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecorItemEntity } from './entity/decor-item.entity';
import { DecorItemService } from './decor-item.service';
import { DecorItemController } from './decor-item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DecorItemEntity])],
  controllers: [DecorItemController],
  providers: [DecorItemService],
  exports: [DecorItemService],
})
export class DecorItemModule {}
