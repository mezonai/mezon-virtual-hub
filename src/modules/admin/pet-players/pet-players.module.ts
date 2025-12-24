import { PetPlayersEntity } from '@modules/pet-players/entity/pet-players.entity';
import { PetSkillsModule } from '@modules/pet-skills/pet-skills.module';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { AdminPetPlayersService } from './pet-players.service';
import { PetPlayersModule } from '@modules/pet-players/pet-players.module';
import { UserModule } from '@modules/user/user.module';
import { NumberRarityModule } from '@modules/number-rarity/number-rarity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetPlayersEntity, PetsEntity]),
    ClsModule,
    PetSkillsModule,
    PetPlayersModule,
    UserModule,
    NumberRarityModule,
  ],
  providers: [AdminPetPlayersService],
  exports: [AdminPetPlayersService],
})
export class AdminPetPlayersModule {}
