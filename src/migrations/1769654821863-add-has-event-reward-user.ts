import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHasEventRewardUser1769654821863 implements MigrationInterface {
    name = 'AddHasEventRewardUser1769654821863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "has_event_reward" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "has_event_reward"`);
    }

}
