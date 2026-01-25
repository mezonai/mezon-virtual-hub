import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapDecorConfigEntity } from './entity/map-decor-config.entity';
import { MapDecorConfigService } from './map-decor-config.service';
import { MapDecorConfigController } from './map-decor-config.controller';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { DecorPlaceholderEntity } from '@modules/decor-placeholder/entity/decor-placeholder.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MapDecorConfigEntity,
      ClanEntity,
      MapEntity,
      DecorPlaceholderEntity,
      DecorItemEntity,
    ]),
  ],
  controllers: [MapDecorConfigController],
  providers: [MapDecorConfigService],
  exports: [MapDecorConfigService],
})
export class MapDecorConfigModule {}
