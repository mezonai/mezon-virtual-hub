import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnTimeLeaveClanForUser1762752673342
  implements MigrationInterface
{
  name = 'AddColumnTimeLeaveClanForUser1762752673342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "time_leave_clan" TIMESTAMP NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN IF EXISTS "time_leave_clan";
    `);
  }
}
