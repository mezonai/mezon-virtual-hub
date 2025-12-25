import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { NumberRarityService } from '@modules/number-rarity/number-rarity.service';

@Injectable()
export class PetSpawnCronJob {
  private readonly logger = new Logger(PetSpawnCronJob.name);

  constructor(
    private readonly petPlayersService: PetPlayersService,
    private readonly numberRarityService: NumberRarityService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAndFillPets() {
    try {
      this.logger.log('Start check & fill pets');
      const numberRarities = await this.numberRarityService.findAll();
      const allRooms = numberRarities.map(nr => nr.room_code);

      for (const room_code of allRooms) {
        const commonNumber = numberRarities.find(nr => nr.room_code === room_code)?.common_number || 6;
        const rareNumber = numberRarities.find(nr => nr.room_code === room_code)?.rare_number || 3;
        const epicNumber = numberRarities.find(nr => nr.room_code === room_code)?.epic_number || 2;
        const legendaryNumber = numberRarities.find(nr => nr.room_code === room_code)?.legendary_number || 0;
        await this.petPlayersService.fillMissingPetsByRoom(room_code, commonNumber, rareNumber, epicNumber, legendaryNumber);
        this.logger.log(`Room ${room_code} checked`);
      }

      this.logger.log('Finished check & fill pets');
    } catch (error) {
      this.logger.error('Error during check & fill pets', error);
    }
  }
}