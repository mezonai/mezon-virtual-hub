import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';
import { PetSpawnCronJob } from '@modules/admin/number-rarity/pet-players.cronjob';
import { AdminNumberRarityService } from '@modules/admin/number-rarity/number-rarity.service';
import { NumberRarityModule } from '@modules/number-rarity/number-rarity.module';
import { PetPlayersModule } from '@modules/pet-players/pet-players.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([NumberRarityEntity]),
    NumberRarityModule,
    PetPlayersModule,
  ],
  providers: [AdminNumberRarityService, PetSpawnCronJob],
  exports: [AdminNumberRarityService],
})
export class AdminNumberRarityModule {}