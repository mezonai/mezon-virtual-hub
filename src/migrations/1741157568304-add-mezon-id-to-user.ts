import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMezonIdToUser1741157568304 implements MigrationInterface {
  name = 'AddMezonIdToUser1741157568304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "mezon_id" VARCHAR UNIQUE NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mezon_id"`);
  }
}
