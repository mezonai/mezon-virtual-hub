import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveHarvestLimitColumns1766392353801 implements MigrationInterface {
  name = 'RemoveHarvestLimitColumns1766392353801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      DROP COLUMN IF EXISTS "harvest_count";
    `);

    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      DROP COLUMN IF EXISTS "harvest_interrupt_count";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      ADD COLUMN "harvest_count" integer DEFAULT 100;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_clan_stats"
      ADD COLUMN "harvest_interrupt_count" integer DEFAULT 100;
    `);
  }
}
