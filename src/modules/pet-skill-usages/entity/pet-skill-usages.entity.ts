// import {
//   Entity,
//   Column,
//   ManyToOne,
//   PrimaryGeneratedColumn,
//   Unique,
//   JoinColumn,
// } from 'typeorm';
// import { PetsEntity } from '@modules/pets/entity/pets.entity';
// import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';

// @Entity('pet_skill_usages')
// @Unique(['pet', 'skill'])
// @Unique(['pet', 'skill_index'])
// export class PetSkillUsageEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => PetsEntity, (pet) => pet.skill_usages, {
//     onDelete: 'CASCADE',
//   })
//   pet: PetsEntity;

//   @ManyToOne(() => PetSkillsEntity, (skill) => skill.skill_usages, {
//     eager: true,
//   })
//   skill: PetSkillsEntity;

//   @Column({ type: 'int' })
//   skill_index: number;
// }
