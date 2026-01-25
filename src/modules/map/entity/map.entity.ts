import { ClanEstateEntity } from '@modules/clan-estate/entity/clan-estate.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from '@types';
import { Column, Entity, OneToMany, Unique } from 'typeorm';

@Entity({ name: 'map' })
@Unique('UQ_map_name', ['name'])
export class MapEntity extends AuditEntity {
  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ example: 'Green Land' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ required: false })
  description?: string;

  @Column({ type: 'int', unique: true })
  index: number;

  @OneToMany(() => ClanEstateEntity, (ce) => ce.realEstate)
  clanEstates: ClanEstateEntity[];
}
