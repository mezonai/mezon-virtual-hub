import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecipeIngredientEntities1768451455500 implements MigrationInterface {
    name = 'AddRecipeIngredientEntities1768451455500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "recipe" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" varchar(50) NOT NULL,
                "pet_id" uuid,
                "item_id" uuid,
                "plant_id" uuid,
                CONSTRAINT "PK_recipe_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "ingredient" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "recipe_id" uuid NOT NULL,
                "item_id" uuid,
                "plant_id" uuid,
                "gold" integer NOT NULL DEFAULT 0,
                "diamond" integer NOT NULL DEFAULT 0,
                "part" integer NOT NULL,
                "required_quantity" integer NOT NULL DEFAULT 1,
                CONSTRAINT "PK_6f1e945604a0b59f56a57570e98" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_recipe_part" UNIQUE ("recipe_id", "part")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ingredient_recipe_id"
            ON "ingredient" ("recipe_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "ingredient"
            ADD CONSTRAINT "FK_ingredient_recipe_id"
            FOREIGN KEY ("recipe_id")
            REFERENCES "recipe"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "ingredient"
            ADD CONSTRAINT "FK_ingredient_item_id"
            FOREIGN KEY ("item_id")
            REFERENCES "item"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "recipe"
            ADD CONSTRAINT "FK_recipe_plant_id"
            FOREIGN KEY ("plant_id")
            REFERENCES "plants"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "ingredient"
            ADD CONSTRAINT "FK_ingredient_plant_id"
            FOREIGN KEY ("plant_id")
            REFERENCES "plants"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "recipe"
            ADD CONSTRAINT "FK_recipe_pet_id"
            FOREIGN KEY ("pet_id")
            REFERENCES "pets"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "recipe"
            ADD CONSTRAINT "FK_recipe_item_id"
            FOREIGN KEY ("item_id")
            REFERENCES "item"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_recipe_item_id"`);
        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_recipe_pet_id"`);
        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_recipe_plant_id"`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_ingredient_plant_id"`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_ingredient_item_id"`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_ingredient_recipe_id"`);
        await queryRunner.query(`DROP INDEX "IDX_ingredient_recipe_id"`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "UQ_recipe_part"`);
        await queryRunner.query(`DROP TABLE "ingredient"`);
        await queryRunner.query(`DROP TABLE "recipe"`);
    }

}
