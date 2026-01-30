import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber } from 'class-validator';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { PetClanEntity } from '@modules/pet-clan/entity/pet-clan.entity';

@Unique('UQ_clan_pet_clan', ['clan_id', 'pet_clan_id'])
@Index('IDX_clan_animals_clan', ['clan_id'])
@Index('IDX_clan_animals_active', ['clan_id', 'is_active'])
@Entity({ name: 'clan_animals' })
export class ClanAnimalEntity extends AuditEntity {
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

  @Column({ type: 'boolean', default: true })
  @ApiProperty()
  @IsBoolean()
  is_active: boolean = true;

  @Column({ type: 'float', default: 0 })
  @ApiProperty()
  @IsNumber()
  bonus_rate_affect: number;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ nullable: true })
  slot_index?: number;

  @Column({ type: 'uuid' })
  clan_id: string;

  @ManyToOne(() => ClanEntity, (clan) => clan.animals, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'clan_id',
    foreignKeyConstraintName: 'FK_clan_animals_clan_id',
  })
  clan: ClanEntity;

  @Column({ type: 'uuid' })
  pet_clan_id: string;

  @ManyToOne(() => PetClanEntity, (petClan) => petClan.clan_animals, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'pet_clan_id',
    foreignKeyConstraintName: 'FK_clan_animals_pet_clan_id',
  })
  pet_clan: PetClanEntity;
}
