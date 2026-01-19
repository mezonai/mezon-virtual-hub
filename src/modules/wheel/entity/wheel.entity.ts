import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';
import { SlotWheelType } from '@enum';
import { SlotWheelEntity } from '@modules/slot-wheel/entity/slot-wheel.entity';

@Entity('wheel')
export class WheelEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_wheel_id',
  })
  id: string;

  @ApiProperty({ enum: SlotWheelType })
  @Column({ type: 'varchar', length: 50 })
  @IsEnum(SlotWheelType)
  type: SlotWheelType;

  @ApiProperty({
    description: 'Phí cơ bản để quay vòng quay',
    example: 100,
  })
  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  base_fee: number;

  @ApiProperty({ type: () => [SlotWheelEntity] })
  @OneToMany(() => SlotWheelEntity, (slot) => slot.wheel, {
    cascade: true,
  })
  slots: SlotWheelEntity[];
}
