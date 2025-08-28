import { RewardItemType, RewardType } from '@enum';
import { RewardItemEntity } from '@modules/reward-item/entity/reward-item.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rewards')
export class RewardEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_rewards_id' })
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description: string | null;

  @ApiProperty({ enum: RewardType })
  @Column({ type: 'varchar', length: 50, unique: true })
  @IsEnum(RewardType)
  type: RewardType;

  @OneToMany(() => RewardItemEntity, (ri) => ri.reward, { cascade: true })
  items: RewardItemEntity[];
}
