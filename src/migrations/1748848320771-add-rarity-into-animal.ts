import { AnimalRarity } from "@enum";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRarityIntoAnimal1748848320771 implements MigrationInterface {
    name = 'AddRarityIntoAnimal1748848320771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animal" DROP COLUMN "catch_percent"`);
        await queryRunner.query(`ALTER TABLE "animal" ADD "catch_chance" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."animal_rarity_enum" AS ENUM('${AnimalRarity.COMMON}', '${AnimalRarity.EPIC}', '${AnimalRarity.LEGENDARY}', '${AnimalRarity.RARE}')`);
        await queryRunner.query(`ALTER TABLE "animal" ADD "rarity" "public"."animal_rarity_enum" NOT NULL DEFAULT 'common'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "animal" DROP COLUMN "rarity"`);
        await queryRunner.query(`DROP TYPE "public"."animal_rarity_enum"`);
        await queryRunner.query(`ALTER TABLE "animal" DROP COLUMN "catch_chance"`);
        await queryRunner.query(`ALTER TABLE "animal" ADD "catch_percent" integer NOT NULL DEFAULT '0'`);
    }

}
