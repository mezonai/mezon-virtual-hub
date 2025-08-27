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
  @ManyToOne(() => QuestEntity, (quest) => quest.player_quests, { eager: true })
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

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  progress: number;

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
