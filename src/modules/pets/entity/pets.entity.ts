import { AnimalRarity, PetType } from '@enum';
import { PetSkillUsageEntity } from '@modules/pet-skill-usages/entity/pet-skill-usages.entity';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, Unique } from 'typeorm';

@Entity('pets')
@Unique('UQ_pets_species_rarity_type', ['species', 'rarity', 'type'])
export class PetsEntity extends AuditEntity {
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

  @ManyToMany(() => PetSkillsEntity, (skill) => skill.pets, {
    eager: false,
  })
  @JoinTable({
    name: 'pet_skill_usages',
    joinColumn: {
      name: 'pet_id',
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

  @OneToMany(() => PetSkillUsageEntity, (usage) => usage.pet, {
    cascade: true,
    eager: true,
  })
  skill_usages: PetSkillUsageEntity[];
}
