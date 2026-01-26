import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { FarmEntity } from '@modules/farm/entity/farm.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Exclude, Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { ClanAnimalEntity } from '@modules/clan-animals/entity/clan-animal.entity';

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

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  weekly_score: number = 0;

  @Column({ type: 'int', default: 20 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  max_members: number = 20;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({
    description: 'Max number of active pets per type in clan',
  })
  @IsInt()
  @Type(() => Number)
  max_slot_pet_active: number = 1;

  @OneToMany(() => UserEntity, (user) => user.clan)
  members: UserEntity[];

  @OneToMany(() => ClanFundEntity, (fund) => fund.clan)
  funds: ClanFundEntity[];

  @OneToOne(() => FarmEntity, { cascade: true })
  @JoinColumn({ name: 'farm_id', foreignKeyConstraintName: 'FK_farm_id_clan' })
  farm: FarmEntity;

  @OneToOne(() => ClanWarehouseEntity, (warehouse) => warehouse.clan, { cascade: true })
  @JoinColumn({ name: 'warehouse_id', foreignKeyConstraintName: 'FK_warehouse_id_clan' })
  warehouse: ClanWarehouseEntity;

  @OneToMany(() => ClanAnimalEntity, (animal) => animal.clan)
  animals: ClanAnimalEntity[];
}
