import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMapClanEstateEntity1768900701406 implements MigrationInterface {
    name = 'AddMapClanEstateEntity1768900701406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "map" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "description" text,
                "index" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_map_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_map_name" UNIQUE ("name"),
                CONSTRAINT "UQ_map_index" UNIQUE ("index")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "clan_estates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "clan_id" uuid NOT NULL,
                "real_estate_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_clan_estates_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_clan_real_estate_once" UNIQUE ("clan_id", "real_estate_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "decor_placeholders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "map_id" uuid NOT NULL,
                "code" character varying(50) NOT NULL,
                "type" character varying(50) NOT NULL,
                "position_index" integer NOT NULL DEFAULT 1,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_decor_placeholders_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_map_placeholder_code" UNIQUE ("map_id", "code")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "decor_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying(50) NOT NULL,
                "name" character varying(100) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_decor_items_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "clan_decor_inventory" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "clan_id" uuid NOT NULL,
                "decor_item_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_clan_decor_inventory_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_clan_decor_inventory" UNIQUE ("clan_id", "decor_item_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "map_decor_configs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "clan_estate_id" uuid NOT NULL,
                "placeholder_id" uuid NOT NULL,
                "decor_item_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_map_decor_configs_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_estate_placeholder_once"
                UNIQUE ("clan_estate_id", "placeholder_id")
            );
        `);
        await queryRunner.query(`ALTER TABLE "recipe" ADD "map_id" uuid`);
        await queryRunner.query(`ALTER TABLE "recipe" ADD "decor_item_id" uuid`);
        await queryRunner.query(`ALTER TABLE "clan_estates" ADD CONSTRAINT "FK_clan_estates_clan_id" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "clan_estates" ADD CONSTRAINT "FK_clan_estates_real_estate_id" FOREIGN KEY ("real_estate_id") REFERENCES "map"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "decor_placeholders" ADD CONSTRAINT "FK_decor_placeholder_map_id" FOREIGN KEY ("map_id") REFERENCES "map"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "clan_decor_inventory" ADD CONSTRAINT "FK_clan_decor_inventory_clan_id" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "clan_decor_inventory" ADD CONSTRAINT "FK_clan_decor_inventory_decor_item_id" FOREIGN KEY ("decor_item_id") REFERENCES "decor_items"("id")`);
        await queryRunner.query(`ALTER TABLE "map_decor_configs" ADD CONSTRAINT "FK_map_decor_config_clan_estate_id" FOREIGN KEY ("clan_estate_id") REFERENCES "clan_estates"("id") ON DELETE CASCADE;`);
        await queryRunner.query(`ALTER TABLE "map_decor_configs" ADD CONSTRAINT "FK_map_decor_config_placeholder_id" FOREIGN KEY ("placeholder_id") REFERENCES "decor_placeholders"("id")`);
        await queryRunner.query(`ALTER TABLE "map_decor_configs" ADD CONSTRAINT "FK_map_decor_config_decor_item_id" FOREIGN KEY ("decor_item_id") REFERENCES "decor_items"("id")`);
        await queryRunner.query(`ALTER TABLE "recipe" ADD CONSTRAINT "FK_recipe_map_id" FOREIGN KEY ("map_id") REFERENCES "map"("id")`);
        await queryRunner.query(`ALTER TABLE "recipe" ADD CONSTRAINT "FK_recipe_decor_item_id" FOREIGN KEY ("decor_item_id") REFERENCES "decor_items"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_recipe_decor_item_id"`);
        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_recipe_map_id"`);
        await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "decor_item_id"`);
        await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "map_id"`);
        await queryRunner.query(`DROP TABLE "map_decor_configs"`);
        await queryRunner.query(`DROP TABLE "clan_decor_inventory"`);
        await queryRunner.query(`DROP TABLE "decor_items"`);
        await queryRunner.query(`DROP TABLE "decor_placeholders"`);
        await queryRunner.query(`DROP TABLE "clan_estates"`);
        await queryRunner.query(`DROP TABLE "map"`);
    }

}
