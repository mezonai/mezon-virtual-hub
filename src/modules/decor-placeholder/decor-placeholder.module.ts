import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecorPlaceholderEntity } from './entity/decor-placeholder.entity';
import { DecorPlaceholderService } from './decor-placeholder.service';
import { DecorPlaceholderController } from './decor-placeholder.controller';
import { MapEntity } from '@modules/map/entity/map.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DecorPlaceholderEntity,
      MapEntity,
    ]),
  ],
  controllers: [DecorPlaceholderController],
  providers: [DecorPlaceholderService],
  exports: [DecorPlaceholderService],
})
export class DecorPlaceholderModule {}
