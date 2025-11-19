import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartEndAtToQuests1763513752175 implements MigrationInterface {
  name = 'AddStartEndAtToQuests1763513752175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quests"
      ADD COLUMN "start_at" TIMESTAMPTZ NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "quests"
      ADD COLUMN "end_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quests"
      DROP COLUMN "end_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "quests"
      DROP COLUMN "start_at"
    `);
  }
}
