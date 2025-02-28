import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { MapEntity } from './entity/map.entity';
import { ClsModule } from 'nestjs-cls';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([MapEntity]), ClsModule, JwtModule],
  providers: [MapService],
  controllers: [MapController],
  exports: [MapService],
})
export class MapModule {}
