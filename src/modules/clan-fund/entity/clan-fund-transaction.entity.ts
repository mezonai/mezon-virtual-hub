import { ClanFundType } from '@enum';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { CLAN_FUNDS_TYPE_ENUM_NAME } from '../constants';

@Entity({ name: 'clan_fund_transactions' })
export class ClanFundTransactionEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_clan_fund_transactions_id',
  })
  id: string;

  @ManyToOne(() => ClanEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'clan_id',
    foreignKeyConstraintName: 'FK_clan_fund_transactions_clan_id',
  })
  clan: ClanEntity;

  @Column({ type: 'uuid' })
  clan_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_clan_fund_transactions_user_id',
  })
  user: UserEntity | null;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({
    type: 'enum',
    enum: ClanFundType,
    enumName: CLAN_FUNDS_TYPE_ENUM_NAME,
  })
  @ApiProperty({
    example: 'gold',
    description: 'Type of fund being contributed',
  })
  @IsEnum(ClanFundType)
  type: ClanFundType;

  @Column({ type: 'int' })
  @ApiProperty({ example: 100, description: 'Amount contributed or deducted' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
