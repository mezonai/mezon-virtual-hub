import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumberRarityController } from './number-rarity.controller';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';
import { NumberRarityService } from '@modules/number-rarity/number-rarity.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NumberRarityEntity]),
  ],
  controllers: [NumberRarityController],
  providers: [NumberRarityService],
  exports: [NumberRarityService],
})
export class NumberRarityModule {}