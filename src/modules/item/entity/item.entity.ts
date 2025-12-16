import { Gender, ItemCode, ItemType } from '@enum';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { Entity, Column, Unique } from 'typeorm';

@Unique('UQ_item_item_code', ['item_code'])
@Entity({ name: 'item' })
export class ItemEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({
    name: 'gender',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  @ApiProperty({
    example: Gender.FEMALE,
    enum: Gender,
  })
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Matches(/^\S+$/, {
    message: 'gender must not contain spaces',
  })
  gender: Gender = Gender.NOT_SPECIFIED;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  @ApiProperty({
    example: ItemType.FACE,
    enum: ItemType,
  })
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Matches(/^\S+$/, {
    message: 'type must not contain spaces',
  })
  type: ItemType;

  @Column({
    name: 'item_code',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  @ApiProperty({
    example: ItemCode.RARITY_CARD_EPIC,
    enum: ItemCode,
  })
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Matches(/^\S+$/, {
    message: 'item_code must not contain spaces',
  })
  item_code: ItemCode | null;

  @Column({ type: 'boolean', default: false })
  is_stackable: boolean;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({
    example: true,
    description: 'Indicates whether this item can be purchased',
  })
  is_purchasable: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({
    example: true,
    description: 'Indicates whether this item can appear as a spin reward',
  })
  is_spin_reward: boolean;

}
