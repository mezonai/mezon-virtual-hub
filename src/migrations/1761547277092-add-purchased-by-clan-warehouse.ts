import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchasedByClanWarehouse1761547277092 implements MigrationInterface {
    name = 'AddPurchasedByClanWarehouse1761547277092'

   public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clan_warehouses"
      ADD COLUMN "purchased_by" uuid NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clan_warehouses"
      DROP COLUMN IF EXISTS "purchased_by";
    `);
  }

}
