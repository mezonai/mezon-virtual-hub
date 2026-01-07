import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeeklyRewardUser1767758978406 implements MigrationInterface {
    name = 'AddWeeklyRewardUser1767758978406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "has_weekly_reward" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "reward_type" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "reward_type"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "has_weekly_reward"`);
    }

}
