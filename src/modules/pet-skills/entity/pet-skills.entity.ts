import { PetType, SkillCode } from '@enum';
import { PetSpeciesEntity } from '@modules/pet-species/entity/pet-species.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimestampColumns } from '@types';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity('pet_skills')
export class PetSkillsEntity extends TimestampColumns {
  @PrimaryColumn({ name: 'skill_code', type: 'varchar', length: 20 })
  @ApiProperty({
    example: 'NOR00',
    enum: SkillCode,
  })
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^\S+$/, {
    message: 'skill_code must not contain spaces',
  })
  skill_code: string;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  @ApiProperty({ example: 'Growl' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @Column({ type: 'varchar', length: 50, default: PetType.NORMAL })
  @ApiProperty({ enum: PetType })
  @IsEnum(PetType)
  type: PetType = PetType.NORMAL;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  attack: number;

  @Column({ type: 'int', default: 100 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  accuracy: number;

  @Column({ name: 'power_points', type: 'int', default: 10 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  power_points: number;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Optional description of the skill. Can be null.',
  })
  @IsOptional()
  @IsString()
  description: string | null;

  @ManyToMany(() => PetSpeciesEntity, (species) => species.pet_skills)
  @ApiProperty({
    type: () => [PetSpeciesEntity],
    description: 'Species that can learn this skill',
  })
  pet_species: PetSpeciesEntity[];
}
