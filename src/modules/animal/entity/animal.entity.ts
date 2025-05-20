import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '@modules/user/entity/user.entity';

@Entity({ name: 'animal' })
export class AnimalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'species', type: 'varchar', length: 255 })
  species: string;

  @Column({ name: 'is_caught', type: 'boolean', default: false })
  is_caught: boolean;

  @Column({ name: 'catch_percent', type: 'int', default: 0 })
  catch_percent: number;

  @Column({ name: 'room_code', type: 'varchar', length: 255, nullable: true })
  room_code: string | null;

  @Column({ name: 'is_brought', type: 'boolean', default: false })
  is_brought: boolean;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;
}
