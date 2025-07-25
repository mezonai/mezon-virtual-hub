import { AnimalRarity, SkillCode } from '@enum';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('pet_players')
export class PetPlayersEntity extends AuditEntity {
  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({
    description: 'Name of the pet to filter by.',
    example: 'Leo',
  })
  @IsOptional()
  @IsString()
  name: string | null;

  @Column({ type: 'int', default: 1 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  level: number = 1;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  exp: number = 0;

  @Column({ type: 'int', default: 1 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  stars: number = 1;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  hp: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  attack: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  defense: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  speed: number = 0;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  @IsBoolean()
  is_brought: boolean = false;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  @IsBoolean()
  is_caught: boolean = false;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({
    description: 'Indicates whether this pet is selected for battle',
    example: false,
  })
  @IsBoolean()
  is_selected_battle: boolean = false;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  individual_value: number = 0;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  @IsOptional()
  @IsString()
  room_code: string | null;

  @ManyToOne(() => PetSkillsEntity, (skill) => skill.skill_usages, {
    eager: true,
  })
  @JoinColumn({ name: 'skill_code_1' })
  skill_slot_1: PetSkillsEntity;

  @ManyToOne(() => PetSkillsEntity, (skill) => skill.skill_usages, {
    eager: true,
  })
  @JoinColumn({ name: 'skill_code_2' })
  skill_slot_2: PetSkillsEntity;

  @ManyToOne(() => PetSkillsEntity, (skill) => skill.skill_usages, {
    eager: true,
  })
  @JoinColumn({ name: 'skill_code_3' })
  skill_slot_3: PetSkillsEntity | null;

  @ManyToOne(() => PetSkillsEntity, (skill) => skill.skill_usages, {
    eager: true,
  })
  @JoinColumn({ name: 'skill_code_4' })
  skill_slot_4: PetSkillsEntity | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => UserEntity })
  user: UserEntity | null;

  @ManyToOne(() => PetsEntity)
  @JoinColumn({ name: 'pet_id' })
  @ApiProperty({ type: () => PetsEntity })
  pet: PetsEntity | null;
}
