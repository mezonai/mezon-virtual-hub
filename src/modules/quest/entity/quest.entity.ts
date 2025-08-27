import { QuestFrequency, QuestType } from '@enum';
import { PlayerQuestEntity } from '@modules/player-quest/entity/player-quest.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('quests')
export class QuestEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quests_id',
  })
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ManyToOne(() => RewardEntity, (reward) => reward.items, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'reward_id',
    foreignKeyConstraintName: 'FK_quests_reward_id',
  })
  reward: RewardEntity;

  @ApiProperty()
  @Column({ type: 'int' })
  @IsInt()
  @Min(1)
  duration_hours: number;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: QuestType })
  @Column({ type: 'varchar', length: 50 })
  @IsEnum(QuestType)
  type: QuestType;

  @ApiProperty({ enum: QuestFrequency })
  @Column({ type: 'varchar', length: 20 })
  @IsEnum(QuestFrequency)
  frequency: QuestFrequency;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  @IsInt()
  @Min(1)
  required_count: number;

  @OneToMany(() => PlayerQuestEntity, (pq) => pq.quest)
  player_quests: PlayerQuestEntity[] | null;
}
