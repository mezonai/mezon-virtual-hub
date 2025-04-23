import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transaction')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'mezon_transaction_id',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  mezon_transaction_id?: string;

  @Column({ name: 'amount', type: 'numeric' })
  amount: number;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  @Column({ name: 'receiver_id', type: 'varchar' })
  receiver_id: string;

  @Column({ name: 'extra_attribute', type: 'varchar', nullable: true })
  extra_attribute?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
