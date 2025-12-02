import { ClanFundType } from '@enum';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { CLAN_FUNDS_TYPE_ENUM_NAME } from '../constants';

@Entity({ name: 'clan_funds' })
@Unique('UQ_clan_funds_type', ['clan_id', 'type'])
export class ClanFundEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_clan_funds_id',
  })
  id: string;

  @ManyToOne(() => ClanEntity, (clan) => clan.funds, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'clan_id',
    foreignKeyConstraintName: 'FK_clan_funds_clan_id',
  })
  clan: ClanEntity;

  @Column({ type: 'uuid' })
  clan_id: string;

  @Column({
    type: 'enum',
    enum: ClanFundType,
    enumName: CLAN_FUNDS_TYPE_ENUM_NAME,
  })
  @ApiProperty({
    example: 'gold',
    description: 'Type of fund (e.g. gold, diamond)',
  })
  @IsEnum(ClanFundType)
  type: ClanFundType;

  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  amount: number;
  
  @Column({ type: 'int' })
  @ApiProperty({ example: 100, description: 'Amount contributed or deducted' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  spent_amount: number;
}
