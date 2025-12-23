import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MapKey } from '@enum';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';

@Injectable()
export class PetSpawnCronJob {
  private readonly logger = new Logger(PetSpawnCronJob.name);
  private readonly petPlayersService: PetPlayersService

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAndFillPets() {
    this.logger.log('Start check & fill pets');

    for (const room_code of Object.values(MapKey)) {
      await this.petPlayersService.fillMissingPetsByRoom(room_code);
      this.logger.log(`Room ${room_code} checked`);
    }

    this.logger.log('Finished check & fill pets');
  }
}