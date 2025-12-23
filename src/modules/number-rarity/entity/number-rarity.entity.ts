import { IsValidRoomCode } from '@libs/decorator';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity('number_rarity')
export class NumberRarityEntity extends AuditEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty({
    description: 'Room code where the pet is located.',
    example: 'sg',
  })
  @IsString()
  @IsValidRoomCode()
  room_code: string;

  @Column({ type: 'int', default: 6 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  common_number: number = 6;

  @Column({ type: 'int', default: 3 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  rare_number: number = 3;

  @Column({ type: 'int', default: 1 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  epic_number: number = 1;

  @Column({ type: 'int', default: 0 })
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  legendary_number: number = 0;
}