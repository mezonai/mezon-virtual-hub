import { TransactionType, TransactionCurrency } from '@enum';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transactions')
export class TransactionsEntity {
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

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionCurrency })
  currency: TransactionCurrency;

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'receiver_id', type: 'varchar', nullable: true })
  receiver_id: string | null;

  @Column({ name: 'extra_attribute', type: 'varchar', nullable: true })
  extra_attribute: string | null;

  @ManyToOne(() => Inventory, { nullable: true })
  @JoinColumn({ name: 'inventory_id' })
  inventory?: Inventory | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
