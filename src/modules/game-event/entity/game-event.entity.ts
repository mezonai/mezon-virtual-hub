import { UserEntity } from '@modules/user/entity/user.entity';
import { AuditEntity } from '@types';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne
} from 'typeorm';

@Entity({ name: 'game_event' })
export class GameEventEntity extends AuditEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'target_user_id' })
  target_user: UserEntity;

  @Column({ default: false })
  is_completed: boolean;

  @ManyToMany(() => UserEntity, { eager: true })
  @JoinTable({
    name: 'event_completed_users',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'completed_user_id', referencedColumnName: 'id' },
  })
  completed_users: UserEntity[];

  @Column()
  max_completed_users: number;
}
