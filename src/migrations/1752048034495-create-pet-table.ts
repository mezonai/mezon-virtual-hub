import { PETS_RARITY_ENUM } from '@constant';
import { AnimalRarity } from '@enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePetsTable1752048034495 implements MigrationInterface {
  name = 'CreatePetsTable1752048034495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."${PETS_RARITY_ENUM}" AS ENUM (
        '${AnimalRarity.COMMON}',
        '${AnimalRarity.EPIC}',
        '${AnimalRarity.LEGENDARY}',
        '${AnimalRarity.RARE}'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "pets" (
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "species" character varying(50) NOT NULL,
        "catch_chance" integer NOT NULL DEFAULT 0,
        "base_hp" integer NOT NULL DEFAULT 0,
        "base_attack" integer NOT NULL DEFAULT 0,
        "base_defense" integer NOT NULL DEFAULT 0,
        "base_speed" integer NOT NULL DEFAULT 0,
        "type" character varying(50) NOT NULL DEFAULT 'normal',
        "rarity" "public"."${PETS_RARITY_ENUM}" NOT NULL DEFAULT 'common',
        CONSTRAINT "PK_7931ba42b915405a93d35f33f34" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_30d2c0e21103e01d3161ea3f92a" UNIQUE ("species", "rarity")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pets"
      DROP CONSTRAINT "UQ_30d2c0e21103e01d3161ea3f92a"
    `);

    await queryRunner.query(`
      DROP TABLE "pets"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."${PETS_RARITY_ENUM}"
    `);
  }
}
