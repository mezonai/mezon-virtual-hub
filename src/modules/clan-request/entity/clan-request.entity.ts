import { ClanRequestStatus } from '@enum';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { IsEnum } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'clan_requests' })
export class ClanRequestEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_clan_requests_id',
  })
  id: string;

  @ManyToOne(() => ClanEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'clan_id',
    foreignKeyConstraintName: 'FK_clan_requests_clan',
  })
  clan: ClanEntity;

  @Column({ type: 'uuid' })
  clan_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_clan_requests_user',
  })
  user: UserEntity;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', default: ClanRequestStatus.PENDING })
  @IsEnum(ClanRequestStatus)
  status: ClanRequestStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  processed_by: string | null;
}
