import { PetSkillsModule } from '@modules/pet-skills/pet-skills.module';
import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PetSpeciesEntity } from './entity/pet-species.entity';
import { PetSpeciesController } from './pet-species.controller';
import { PetSpeciesService } from './pet-species.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetSpeciesEntity]),
    ClsModule,
    PetSkillsModule,
    forwardRef(() => UserModule),
  ],
  providers: [PetSpeciesService],
  controllers: [PetSpeciesController],
  exports: [PetSpeciesService],
})
export class PetSpeciesModule {}
