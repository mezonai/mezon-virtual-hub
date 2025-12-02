import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWarehouseidToClan1762141619210 implements MigrationInterface {
  name = 'AddWarehouseidToClan1762141619210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "clans" ADD COLUMN "warehouse_id" uuid;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clans" DROP COLUMN "warehouse_id";
    `);
  }
}
