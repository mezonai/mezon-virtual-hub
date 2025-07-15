import { AnimalRarity } from '@enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePetSpeciesTable1752048034495 implements MigrationInterface {
  name = 'CreatePetSpeciesTable1752048034495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pet_species_rarity_enum" AS ENUM('${AnimalRarity.COMMON}', '${AnimalRarity.EPIC}', '${AnimalRarity.LEGENDARY}', '${AnimalRarity.RARE}')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pet_species" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "species" character varying(50) NOT NULL, "catch_chance" integer NOT NULL DEFAULT '0', "base_hp" integer NOT NULL DEFAULT '0', "base_attack" integer NOT NULL DEFAULT '0', "base_defense" integer NOT NULL DEFAULT '0', "base_speed" integer NOT NULL DEFAULT '0', "type" character varying(50) NOT NULL DEFAULT 'normal', "rarity" "public"."pet_species_rarity_enum" NOT NULL DEFAULT 'common', CONSTRAINT "UQ_7f408adddb8ab0ce57e90ea9836" UNIQUE ("species"), CONSTRAINT "PK_7931ba42b915405a93d35f33f34" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pet_species"`);
    await queryRunner.query(`DROP TYPE "public"."pet_species_rarity_enum"`);
  }
}
