import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Exclude, Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity({ name: 'clans' })
@Unique('UQ_clan_name', ['name'])
export class ClanEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @Type(() => String)
  description?: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  @Exclude()
  default_position_x: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  @Exclude()
  default_position_y: number;

  @Column({ type: 'boolean', default: true })
  @Exclude()
  is_locked: boolean;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  fund: number = 0;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  score: number = 0;

  @Column({ type: 'int', default: 20 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  max_members: number = 20;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'leader_id',
    foreignKeyConstraintName: 'FK_clans_leader_id',
  })
  @ApiProperty({ type: () => UserEntity })
  leader: UserEntity | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  leader_id: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'vice_leader_id',
    foreignKeyConstraintName: 'FK_clans_vice_leader_id',
  })
  @ApiProperty({ type: () => UserEntity })
  vice_leader: UserEntity | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  vice_leader_id: string | null;

  @OneToMany(() => UserEntity, (user) => user.clan)
  members: UserEntity[];

  @OneToMany(() => ClanFundEntity, (fund) => fund.clan)
  funds: ClanFundEntity[];
}
