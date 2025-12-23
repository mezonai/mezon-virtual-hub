import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminNumberRarityService } from './number-rarity.service';
import { AdminNumberRarityController } from './number-rarity.controller';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';
import { NumberRarityModule } from '@modules/number-rarity/number-rarity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NumberRarityEntity]),
    NumberRarityModule,
  ],
  controllers: [AdminNumberRarityController],
  providers: [AdminNumberRarityService],
  exports: [AdminNumberRarityService],
})
export class AdminNumberRarityModule {}
