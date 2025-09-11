import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProgressToProgressHistory1757564473540 implements MigrationInterface {
    name = 'UpdateProgressToProgressHistory1757564473540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "player_quests" DROP COLUMN "progress"`,
        );
        await queryRunner.query(
            `ALTER TABLE "player_quests" ADD "progress_history" json NOT NULL DEFAULT '[]'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "player_quests" DROP COLUMN "progress_history"`,
        );
        await queryRunner.query(
            `ALTER TABLE "player_quests" ADD "progress" integer NOT NULL DEFAULT '0'`,
        );
    }

}
