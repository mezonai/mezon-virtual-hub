import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPetClanAnimalEntity1768549264104 implements MigrationInterface {
    name = 'AddPetClanAnimalEntity1768549264104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "pet_clan" (
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "description" text,
                "type" character varying(50) NOT NULL DEFAULT 'dog',
                "base_rate_affect" integer NOT NULL DEFAULT 10,
                "base_exp_per_level" integer NOT NULL DEFAULT 1000,
                "base_exp_increment_per_level" double precision NOT NULL DEFAULT 1.5,
                "max_level" integer NOT NULL DEFAULT 10,
                "level_up_rate_multiplier" double precision NOT NULL DEFAULT 0.5,
                CONSTRAINT "PK_a6f54b4cb4001dcbde96c58b36c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "clan_animals" (
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "level" integer NOT NULL DEFAULT 1,
                "exp" integer NOT NULL DEFAULT 0,
                "is_active" boolean NOT NULL DEFAULT true,
                "bonus_rate_affect" double precision NOT NULL DEFAULT 0,
                "slot_index" integer,
                "clan_id" uuid NOT NULL,
                "pet_clan_id" uuid NOT NULL,
                CONSTRAINT "UQ_clan_pet_clan" UNIQUE ("clan_id", "pet_clan_id"),
                CONSTRAINT "PK_3d8e2d0635f338392487957b9cc" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_clan_animals_active" ON "clan_animals" ("clan_id", "is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_clan_animals_clan" ON "clan_animals" ("clan_id") `);
        await queryRunner.query(`ALTER TABLE "clans" ADD "max_slot_pet_active" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "recipe" ADD "pet_clan_id" uuid`);
        await queryRunner.query(`ALTER TABLE "clan_animals" ADD CONSTRAINT "FK_clan_animals_clan_id" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clan_animals" ADD CONSTRAINT "FK_clan_animals_pet_clan_id" FOREIGN KEY ("pet_clan_id") REFERENCES "pet_clan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe" ADD CONSTRAINT "FK_recipe_pet_clan_id" FOREIGN KEY ("pet_clan_id") REFERENCES "pet_clan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_recipe_pet_clan_id"`);
        await queryRunner.query(`ALTER TABLE "recipe" DROP COLUMN "pet_clan_id"`);
        await queryRunner.query(`ALTER TABLE "clan_animals" DROP CONSTRAINT "FK_clan_animals_pet_clan_id"`);
        await queryRunner.query(`ALTER TABLE "clan_animals" DROP CONSTRAINT "FK_clan_animals_clan_id"`);
        await queryRunner.query(`DROP INDEX "IDX_clan_animals_active"`);
        await queryRunner.query(`DROP INDEX "IDX_clan_animals_clan"`);
        await queryRunner.query(`ALTER TABLE "clans" DROP COLUMN "max_slot_pet_active"`);
        await queryRunner.query(`DROP TABLE "clan_animals"`);
        await queryRunner.query(`DROP TABLE "pet_clan"`);
    }

}
