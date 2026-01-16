import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm';
import { PetClanType } from '@enum';
import { ClanAnimalEntity } from '@modules/clan-animals/entity/clan-animal.entity';

@Entity({ name: 'pet_clan' })
export class PetClanEntity extends AuditEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: PetClanType.DOG })
  @ApiProperty({ enum: PetClanType })
  @IsEnum(PetClanType)
  type: PetClanType = PetClanType.DOG;

  @Column({ type: 'float', default: 0.1 })
  @ApiProperty()
  @IsNumber()
  base_rate_affect: number;

  @OneToMany(() => ClanAnimalEntity, (animal) => animal.pet_clan)
  clan_animals: ClanAnimalEntity[];
}
