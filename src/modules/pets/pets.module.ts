import { PetSkillsModule } from '@modules/pet-skills/pet-skills.module';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PetsEntity } from './entity/pets.entity';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetsEntity]),
    ClsModule,
    PetSkillsModule,
    forwardRef(() => UserModule),
  ],
  providers: [PetsService],
  controllers: [PetsController],
  exports: [PetsService],
})
export class PetsModule {}
