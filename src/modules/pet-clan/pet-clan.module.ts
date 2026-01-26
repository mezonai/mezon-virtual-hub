import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetClanEntity } from './entity/pet-clan.entity';
import { PetClanService } from './pet-clan.service';
import { PetClanController } from './pet-clan.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetClanEntity]),
  ],
  controllers: [PetClanController],
  providers: [PetClanService],
  exports: [PetClanService],
})
export class PetClanModule {}
