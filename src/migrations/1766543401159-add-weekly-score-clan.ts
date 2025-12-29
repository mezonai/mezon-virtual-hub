import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeeklyScoreClan1766543401159 implements MigrationInterface {
    name = 'AddWeeklyScoreClan1766543401159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clans" ADD "weekly_score" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clans" DROP COLUMN "weekly_score"`);
    }

}
