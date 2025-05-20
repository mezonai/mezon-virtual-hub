import { FoodType, PurchaseMethod } from '@enum';
import { AuditEntity } from '@types';
import { Max } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'food' })
export class FoodEntity extends AuditEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', unique: true })
  type: FoodType;

  @Column({ type: 'enum', enum: PurchaseMethod, name: 'purchase_method' })
  purchase_method: PurchaseMethod;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ type: 'float', name: 'catch_rate_bonus' })
  @Max(100)
  catch_rate_bonus: number;
}
