import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateHarvestMaxAndHarvestInterruptMaxForUser1764147363490
  implements MigrationInterface
{
  name = 'UpdateHarvestMaxAndHarvestInterruptMaxForUser1764147363490';

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
          "harvest_interrupt_count" = 100
      WHERE "harvest_count" <> 100
         OR "harvest_interrupt_count" <> 100;
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
