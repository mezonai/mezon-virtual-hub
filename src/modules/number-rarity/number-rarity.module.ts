import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumberRarityService } from './number-rarity.service';
import { NumberRarityController } from './number-rarity.controller';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NumberRarityEntity]),
  ],
  controllers: [NumberRarityController],
  providers: [NumberRarityService],
  exports: [NumberRarityService],
})
export class NumberRarityModule {}
