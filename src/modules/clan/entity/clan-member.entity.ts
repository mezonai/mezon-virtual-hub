import { Entity, Column, ManyToOne, JoinColumn, Unique, Index, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '@/modules/user/entity/user.entity';
import { ClanEntity } from '@/modules/clan/entity/clan.entity';
import { ClanRole } from '@enum';

@Entity({ name: 'clan_members' })
// 🧩 Each user can belong to only one clan
@Index('UQ_user_single_active_clan', ['user_id'], {
  unique: true,
  where: `"leave_at" IS NULL`,
})
@Index('UQ_clan_leader_unique', ['clan_id'], {
  unique: true,
  where: `"role" = '${ClanRole.LEADER}' AND "leave_at" IS NULL`,
})
@Index('UQ_clan_vice_leader_unique', ['clan_id'], {
  unique: true,
  where: `"role" = '${ClanRole.VICE_LEADER}' AND "leave_at" IS NULL`,
})
export class ClanMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClanEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clan_id' })
  clan: ClanEntity;

  @Column({ type: 'uuid' })
  clan_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: ClanRole,
    default: ClanRole.MEMBER,
  })
  role: ClanRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  leave_at: Date | null;
}
