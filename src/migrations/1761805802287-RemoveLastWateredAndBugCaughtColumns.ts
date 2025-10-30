import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLastWateredAndBugCaughtColumns1761805802287 implements MigrationInterface {
    name = 'RemoveLastWateredAndBugCaughtColumns1761805802287'

   public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "slot_plants" DROP COLUMN "last_watered_by"`);
        await queryRunner.query(`ALTER TABLE "slot_plants" DROP COLUMN "last_bug_caught_by"`);
        await queryRunner.query(`ALTER TABLE "slot_plants" DROP COLUMN "need_water"`);
        await queryRunner.query(`ALTER TABLE "slot_plants" DROP COLUMN "has_bug"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "slot_plants" ADD "last_watered_by" character varying`);
        await queryRunner.query(`ALTER TABLE "slot_plants" ADD "last_bug_caught_by" character varying`);
        await queryRunner.query(`ALTER TABLE "slot_plants" ADD "need_water" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "slot_plants" ADD "has_bug" boolean NOT NULL DEFAULT false`);
    }

}
