import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';

@Unique('UQ_recipe_part', ['recipe_id', 'part'])
@Index('IDX_ingredient_recipe_id', ['recipe_id'])
@Entity('ingredient')
export class IngredientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  recipe_id: string;

  @ManyToOne(() => RecipeEntity, (r) => r.ingredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  recipe: RecipeEntity;

  @Column({ type: 'uuid', nullable: true })
  item_id?: string;

  @ManyToOne(() => ItemEntity, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item?: ItemEntity;

  @Column({ type: 'uuid', nullable: true })
  plant_id?: string;

  @ManyToOne(() => PlantEntity, { nullable: true })
  @JoinColumn({ name: 'plant_id' })
  plant?: PlantEntity;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({ type: 'int', default: 0 })
  diamond: number;

  @Column({ type: 'int' })
  part: number;

  @Column({ type: 'int', default: 1 })
  required_quantity: number;
}
