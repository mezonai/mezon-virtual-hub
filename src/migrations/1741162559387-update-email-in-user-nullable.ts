import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEmailInUserNullable1741162559387
  implements MigrationInterface
{
  name = 'UpdateEmailInUserNullable1741162559387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "email" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" 
      ALTER COLUMN "email" SET NOT NULL
    `);
  }
}
