import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapDecorConfigEntity } from './entity/map-decor-config.entity';
import { MapDecorConfigService } from './map-decor-config.service';
import { MapDecorConfigController } from './map-decor-config.controller';
import { DecorPlaceholderEntity } from '@modules/decor-placeholder/entity/decor-placeholder.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { ClanEstateEntity } from '@modules/clan-estate/entity/clan-estate.entity';
import { ClanDecorInventoryEntity } from '@modules/clan-decor-invetory/entity/clan-decor-inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MapDecorConfigEntity,
      DecorPlaceholderEntity,
      DecorItemEntity,
      ClanEstateEntity,
      ClanDecorInventoryEntity,
    ]),
  ],
  controllers: [MapDecorConfigController],
  providers: [MapDecorConfigService],
  exports: [MapDecorConfigService],
})
export class MapDecorConfigModule {}
