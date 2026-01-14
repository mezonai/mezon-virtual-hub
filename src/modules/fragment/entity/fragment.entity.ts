import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { FragmentItemEntity } from '@modules/fragment-item/entity/fragment-item.entity';

@Entity('fragment')
export class FragmentEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_fragment_id',
  })
  id: string;

  @Column({ type: 'uuid' })
  pet_id: string;

  @ManyToOne(() => PetsEntity, { eager: true })
  @JoinColumn({
    name: 'pet_id',
    foreignKeyConstraintName: 'FK_fragment_pet_id',
  })
  pet: PetsEntity;

  @OneToMany(() => FragmentItemEntity, (fi) => fi.fragment, { cascade: true, })
  fragmentItems: FragmentItemEntity[];
}

