import { FragmentEntity } from "@modules/fragment/entity/fragment.entity";
import { ItemEntity } from "@modules/item/entity/item.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Unique('UQ_fragment_part', ['fragment_id', 'part'])
@Unique('UQ_fragment_item', ['fragment_id', 'item_id'])
@Index('IDX_fragment_item_fragment', ['fragment_id'])
@Index('IDX_fragment_item_item', ['item_id'])
@Entity('fragment_item')
export class FragmentItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fragment_id: string;

  @ManyToOne(() => FragmentEntity, (f) => f.fragmentItems)
  @JoinColumn({ name: 'fragment_id' })
  fragment: FragmentEntity;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => ItemEntity)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;

  @Column({ type: 'int' })
  part: number;

  @Column({ type: 'int', default: 1 })
  required_quantity: number;
}
