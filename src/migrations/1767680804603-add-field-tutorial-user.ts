import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldTutorialUser1767680804603 implements MigrationInterface {
    name = 'AddFieldTutorialUser1767680804603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isTutorialCompleted" boolean`);
        await queryRunner.query(`UPDATE "user" SET "isTutorialCompleted" = true WHERE "isTutorialCompleted" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isTutorialCompleted" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isTutorialCompleted" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTutorialCompleted"`);
    }
}
