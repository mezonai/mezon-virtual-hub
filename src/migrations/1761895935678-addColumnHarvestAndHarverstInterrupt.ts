import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnHarvestAndHarverstInterrupt1761895935678
  implements MigrationInterface
{
  name = 'AddColumnHarvestAndHarverstInterrupt1761895935678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "harvest_count" int DEFAULT 0 NOT NULL;
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "harvest_interrupt_count" int DEFAULT 0 NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "harvest_interrupt_count";
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "harvest_count";
        `);
  }
}
