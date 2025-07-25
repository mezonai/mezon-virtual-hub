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
@Index(['pet', 'skill'], { unique: true })
@Index(['pet', 'skill_index'], { unique: true })
export class PetSkillUsageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PetsEntity, (pet) => pet.skill_usages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pet_id' })
  pet: PetsEntity;

  @ManyToOne(() => PetSkillsEntity, (skill) => skill.skill_usages, {
    eager: true,
  })
  @JoinColumn({ name: 'skill_code' })
  skill: PetSkillsEntity;

  @Column({ type: 'int' })
  skill_index: number;
}
