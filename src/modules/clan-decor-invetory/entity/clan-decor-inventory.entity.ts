import { AuditEntity } from '@types';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';

@Entity({ name: 'clan_decor_inventory' })
@Unique('UQ_clan_decor_inventory', ['clan', 'decorItem'])
export class ClanDecorInventoryEntity extends AuditEntity {
  @ManyToOne(() => ClanEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'clan_id',
    foreignKeyConstraintName: 'FK_clan_decor_inventory_clan_id',
  })
  clan: ClanEntity;

  @ManyToOne(() => DecorItemEntity, { nullable: false })
  @JoinColumn({
    name: 'decor_item_id',
    foreignKeyConstraintName: 'FK_clan_decor_inventory_decor_item_id',
  })
  decorItem: DecorItemEntity;
}
