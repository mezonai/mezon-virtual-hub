import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { IngredientEntity } from '@modules/ingredient/entity/ingredient.entity';
import { RecipeType } from '@enum';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { PetClanEntity } from '@modules/pet-clan/entity/pet-clan.entity';

@Entity('recipe')
export class RecipeEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_recipe_id',
  })
  id: string;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  type: RecipeType;

  @Column({ type: 'uuid', nullable: true })
  pet_id?: string;

  @ManyToOne(() => PetsEntity, { eager: true, nullable: true })
  @JoinColumn({
    name: 'pet_id',
    foreignKeyConstraintName: 'FK_recipe_pet_id',
  })
  pet?: PetsEntity;

  @Column({ type: 'uuid', nullable: true })
  item_id?: string;

  @ManyToOne(() => ItemEntity, { eager: true, nullable: true })
  @JoinColumn({
    name: 'item_id',
    foreignKeyConstraintName: 'FK_recipe_item_id',
  })
  item?: ItemEntity;

  @Column({ type: 'uuid', nullable: true })
  plant_id?: string;

  @ManyToOne(() => PlantEntity, { eager: true, nullable: true })
  @JoinColumn({
    name: 'plant_id',
    foreignKeyConstraintName: 'FK_recipe_plant_id',
  })
  plant?: PlantEntity;

  @Column({ type: 'uuid', nullable: true })
  map_id?: string;

  @ManyToOne(() => MapEntity, { eager: true, nullable: true })
  @JoinColumn({
    name: 'map_id',
    foreignKeyConstraintName: 'FK_recipe_map_id',
  })
  map?: MapEntity;
  
  @Column({ type: 'uuid', nullable: true })
  decor_item_id?: string;

  @ManyToOne(() => DecorItemEntity, { eager: true, nullable: true })
  @JoinColumn({
    name: 'decor_item_id',
    foreignKeyConstraintName: 'FK_recipe_decor_item_id',
  })
  decor_item?: DecorItemEntity;

  @Column({ type: 'uuid', nullable: true })
  pet_clan_id?: string;

  @ManyToOne(() => PetClanEntity, { eager: true, nullable: true })
  @JoinColumn({
    name: 'pet_clan_id',
    foreignKeyConstraintName: 'FK_recipe_pet_clan_id',
  })
  pet_clan?: PetClanEntity;

  @OneToMany(() => IngredientEntity, (ing) => ing.recipe, {
    cascade: true,
  })
  ingredients: IngredientEntity[];
}
