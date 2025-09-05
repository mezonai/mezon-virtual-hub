import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsInt, Min } from 'class-validator';
import { UserEntity } from '@modules/user/entity/user.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';

@Entity('player_quests')
export class PlayerQuestEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_player_quests_id',
  })
  id: string;

  @ApiProperty({ type: () => QuestEntity })
@ManyToOne(() => QuestEntity, (quest) => quest.player_quests, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'quest_id',
    foreignKeyConstraintName: 'FK_player_quests_quest_id',
  })
  quest: QuestEntity;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_player_quests_user_id',
  })
  user: UserEntity;

  @ApiProperty({
    description: 'Progress entries with timestamp and optional label',
    example: [
      { timestamp: '2025-09-05T10:00:00Z', label: 'collected_sword' },
      { timestamp: '2025-09-05T12:00:00Z', label: 'defeated_dragon' },
    ],
  })
  @Column({ type: 'json', default: () => "'[]'" })
  progress_history: { timestamp: Date; label?: string }[];

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  is_completed: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  is_claimed: boolean;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  @IsDate()
  completed_at: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  @IsDate()
  start_at: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  @IsDate()
  end_at: Date | null;
}
