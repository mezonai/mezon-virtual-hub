import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { GameConfigEntity } from './entity/game-config.entity';
import { GameConfigController } from './game-config.controller';
import { gameConfigService } from './game-config.service';
import { GameConfigStore } from './game-config.store';

@Module({
  imports: [TypeOrmModule.forFeature([GameConfigEntity]), ClsModule],
  providers: [gameConfigService, GameConfigStore],
  controllers: [GameConfigController],
  exports: [GameConfigStore, gameConfigService],
})
export class GameConfigModule {}
