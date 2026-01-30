import { AuditEntity } from '@types';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { DecorPlaceholderEntity } from '@modules/decor-placeholder/entity/decor-placeholder.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { ClanEstateEntity } from '@modules/clan-estate/entity/clan-estate.entity';

@Entity({ name: 'map_decor_configs' })
@Unique('UQ_estate_placeholder_once', ['clanEstate', 'placeholder'])
export class MapDecorConfigEntity extends AuditEntity {

  @ManyToOne(() => ClanEstateEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'clan_estate_id',
    foreignKeyConstraintName: 'FK_map_decor_config_clan_estate_id',
  })
  clanEstate: ClanEstateEntity;

  @ManyToOne(() => DecorPlaceholderEntity, { nullable: false })
  @JoinColumn({
    name: 'placeholder_id',
    foreignKeyConstraintName: 'FK_map_decor_config_placeholder_id',
  })
  placeholder: DecorPlaceholderEntity;

  @ManyToOne(() => DecorItemEntity, { nullable: false })
  @JoinColumn({
    name: 'decor_item_id',
    foreignKeyConstraintName: 'FK_map_decor_config_decor_item_id',
  })
  decorItem: DecorItemEntity;
}

