import { UserModule } from '@modules/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { PetSkillsEntity } from './entity/pet-skills.entity';
import { PetSkillsController } from './pet-skills.controller';
import { PetSkillsService } from './pet-skills.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PetSkillsEntity]),
    ClsModule,
    forwardRef(() => UserModule),
  ],
  providers: [PetSkillsService],
  controllers: [PetSkillsController],
  exports: [PetSkillsService],
})
export class PetSkillsModule {}
