import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLimitHarvestForUser1766148942403 implements MigrationInterface {
    name = 'UpdateLimitHarvestForUser1766148942403'

   public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      ALTER COLUMN "harvest_count" SET DEFAULT 100;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      ALTER COLUMN "harvest_interrupt_count" SET DEFAULT 100;
    `);

    await queryRunner.query(`
      UPDATE "user_clan_stats"
      SET "harvest_count" = 100,
          "harvest_interrupt_count" = 100;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      ALTER COLUMN "harvest_count" SET DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      ALTER COLUMN "harvest_interrupt_count" SET DEFAULT 0;
    `);

    await queryRunner.query(`
      UPDATE "user_clan_stats"
      SET "harvest_count" = 0,
          "harvest_interrupt_count" = 0;
    `);
  }
}
