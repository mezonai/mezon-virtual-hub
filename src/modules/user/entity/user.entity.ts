import { ClanRole, Gender, Role } from '@enum';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Exclude, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';

@Entity({ name: 'user' })
@Index('UQ_clan_leader', ['clan_id'], {
  unique: true,
  where: `"clan_role" = '${ClanRole.LEADER}' AND "clan_id" IS NOT NULL`,
})
@Index('UQ_clan_vice_leader', ['clan_id'], {
  unique: true,
  where: `"clan_role" = '${ClanRole.VICE_LEADER}' AND "clan_id" IS NOT NULL`,
})
export class UserEntity extends AuditEntity {
  @Column({ type: 'varchar', unique: true, nullable: true })
  @Exclude()
  external_id: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty({
    description: 'Mezon_id of the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  mezon_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  auth_provider: string | null;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  display_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string | null;

  @Column({ type: 'int', default: 0 })
  position_x: number;

  @Column({ type: 'int', default: 0 })
  position_y: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({
    description: 'Gold of the user',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  gold: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({
    description: 'Diamond of the user',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  diamond: number;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({
    description: 'The gender of the user',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender | null;

  @Column('text', { array: true, nullable: true })
  skin_set: string[];

  @ManyToOne(() => ClanEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clan_id', foreignKeyConstraintName: 'FK_user_clan' })
  clan: ClanEntity | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  clan_id: string | null;

  @OneToMany(() => Inventory, (inventory) => inventory.user)
  inventories: Inventory[];

  @Column({ type: 'bool', default: false })
  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  has_first_reward: boolean;

  @Column({ type: 'int', default: Role.USER })
  @ApiProperty({
    enum: Role,
    description: 'Role of the user. 0 = USER, 1 = ADMIN',
    example: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @Column({
    enumName: 'user_clan_role_enum',
    type: 'enum',
    enum: ClanRole,
    default: ClanRole.MEMBER,
  })
  @ApiProperty({
    enum: ClanRole,
    enumName: 'Role',
    example: ClanRole.MEMBER,
  })

  @IsOptional()
  @IsEnum(ClanRole)
  clan_role: ClanRole;

  @Column({ type: 'timestamp', nullable: true })
  time_leave_clan?: Date;

  @ApiProperty({description: 'Score user in clan' })
  @OneToMany(() => UserClanStatEntity, (score) => score.user)
  scores: UserClanStatEntity[];
}
