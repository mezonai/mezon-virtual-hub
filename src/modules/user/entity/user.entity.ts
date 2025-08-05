import { Gender, Role } from '@enum';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
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
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'user' })
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

  @Column({ type: 'varchar' })
  gender: Gender;

  @Column('text', { array: true, nullable: true })
  skin_set: string[];

  @ManyToOne(() => MapEntity, { nullable: true })
  @JoinColumn({ name: 'map_id' })
  map: MapEntity | null;

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
    enumName: 'Role',
    description: 'Role of the user. 0 = USER, 1 = ADMIN',
    example: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
