import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnimalRarity, PetType } from '@enum';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AuditEntity } from '@types';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';

@Entity('pet_species')
@Unique(['species'])
export class PetSpeciesEntity extends AuditEntity {
  @Column({ type: 'varchar', length: 50 })
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  species: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  catch_chance: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  base_hp: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  base_attack: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  base_defense: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  base_speed: number = 0;

  @Column({ type: 'varchar', length: 50, default: PetType.NORMAL })
  @ApiProperty({ enum: PetType })
  @IsEnum(PetType)
  type: PetType = PetType.NORMAL;

  @Column({
    name: 'rarity',
    type: 'enum',
    enum: AnimalRarity,
    default: AnimalRarity.COMMON,
  })
  @ApiPropertyOptional({
    description: 'Rarity of the animal',
    enum: AnimalRarity,
  })
  @IsOptional()
  @IsEnum(AnimalRarity)
  rarity: AnimalRarity = AnimalRarity.COMMON;

  @ManyToMany(() => PetSkillsEntity, (skill) => skill.pet_species, { eager: false })
  @JoinTable({
    name: 'pet_species_skills',
    joinColumn: {
      name: 'pet_species_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'skill_code',
      referencedColumnName: 'skill_code',
    },
  })
  @ApiProperty({
    type: () => [PetSkillsEntity],
    description: 'List of skills this pet species can learn',
  })
  pet_skills: PetSkillsEntity[];
}
