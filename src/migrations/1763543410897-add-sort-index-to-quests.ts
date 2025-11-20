import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSortIndexToQuests1763543410897 implements MigrationInterface {
  name = 'AddSortIndexToQuests1763543410897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "quests"
            ADD COLUMN "sort_index" INT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "quests"
            DROP COLUMN "sort_index"
        `);
  }
}
