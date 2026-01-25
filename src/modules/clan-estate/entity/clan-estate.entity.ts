import { AuditEntity } from '@types';
import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';

@Entity({ name: 'clan_estates' })
@Unique('UQ_clan_real_estate_once', ['clan', 'realEstate'])
export class ClanEstateEntity extends AuditEntity {

  @ManyToOne(() => ClanEntity, (clan) => clan.estates, {
    nullable: false
  })
  @JoinColumn({
    name: 'clan_id',
    foreignKeyConstraintName: 'FK_clan_estates_clan_id',
  })
  clan: ClanEntity;

  @ManyToOne(() => MapEntity, (map) => map.clanEstates, {
    nullable: false
  })
  @JoinColumn({
    name: 'real_estate_id',
    foreignKeyConstraintName: 'FK_clan_estates_real_estate_id',
  })
  realEstate: MapEntity;
}