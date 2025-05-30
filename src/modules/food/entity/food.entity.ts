import { FoodType, PurchaseMethod } from '@enum';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { AuditEntity } from '@types';
import { Max } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'food' })
export class FoodEntity extends AuditEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', unique: true })
  type: FoodType;

  @Column({ type: 'enum', enum: PurchaseMethod, name: 'purchase_method', enumName: 'purchase_method_enum', })
  purchase_method: PurchaseMethod;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'float', name: 'catch_rate_bonus' })
  @Max(100)
  catch_rate_bonus: number;

  @OneToMany(() => Inventory, inventory => inventory.food)
  inventories: Inventory[];
}
