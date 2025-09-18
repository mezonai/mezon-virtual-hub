import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
  Index,
} from 'typeorm';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';

@Entity('pet_skill_usages')
@Unique('IDX_pet_skill_usages_skill_code', ['pet', 'skill'])
@Unique('UQ_pet_skill_usages_pet_index', ['pet', 'skill_index'])
export class PetSkillUsageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PetsEntity, (pet) => pet.skill_usages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'pet_id',
    foreignKeyConstraintName: 'FK_pet_skill_usages_pet_id',
  })
  pet: PetsEntity;

  @ManyToOne(() => PetSkillsEntity, (skill) => skill.skill_usages, {
    eager: true,
  })
  @JoinColumn({
    name: 'skill_code',
    foreignKeyConstraintName: 'FK_pet_skill_usages_skill_code',
  })
  skill: PetSkillsEntity;

  @Column({ type: 'int' })
  skill_index: number;
}
