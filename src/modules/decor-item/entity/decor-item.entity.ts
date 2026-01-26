import { ClanDecorInventoryEntity } from '@modules/clan-decor-invetory/entity/clan-decor-inventory.entity';
import { MapDecorConfigEntity } from '@modules/map-decor-config/entity/map-decor-config.entity';
import { AuditEntity } from '@types';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'decor_items' })
export class DecorItemEntity extends AuditEntity {
  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => ClanDecorInventoryEntity, (inv) => inv.decorItem)
  inventories: ClanDecorInventoryEntity[];

  @OneToMany(() => MapDecorConfigEntity, (cfg) => cfg.decorItem)
  mapConfigs: MapDecorConfigEntity[];
}
