import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTutorial1767757298928 implements MigrationInterface {
    name = 'UpdateUserTutorial1767757298928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTutorialCompleted"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isPlantTutorialCompleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isPetTutorialCompleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`
            UPDATE "user"
            SET 
                "isPlantTutorialCompleted" = true,
                "isPetTutorialCompleted" = true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
       
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isPetTutorialCompleted"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isPlantTutorialCompleted"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isTutorialCompleted" boolean NOT NULL DEFAULT false`);
    }

}
