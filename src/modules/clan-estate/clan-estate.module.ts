import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClanEstateEntity } from './entity/clan-estate.entity';
import { ClanEstateService } from './clan-estate.service';
import { ClanEstateController } from './clan-estate.controller';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClanEstateEntity,
      ClanEntity,
      MapEntity,
    ]),
  ],
  controllers: [ClanEstateController],
  providers: [ClanEstateService],
  exports: [ClanEstateService],
})
export class ClanEstateModule {}
