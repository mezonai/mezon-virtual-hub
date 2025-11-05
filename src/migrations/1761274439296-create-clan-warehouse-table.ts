import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarehouseTable1761274439296 implements MigrationInterface {
  name = 'CreateFarmWarehouseTable1761274439296';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "inventory_clan_type_enum" AS ENUM ('PLANT');
    `);

    await queryRunner.query(`
      CREATE TABLE "clan_warehouses" ( "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clan_id" uuid NOT NULL,"item_id" uuid NOT NULL,"type" "inventory_clan_type_enum" NOT NULL DEFAULT 'PLANT',"quantity" integer NOT NULL DEFAULT 0, "is_harvested" boolean NOT NULL DEFAULT false, "purchased_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(),"updated_at" TIMESTAMP NOT NULL DEFAULT now(),CONSTRAINT "PK_clan_warehouse_id" PRIMARY KEY ("id"));
    `);

    await queryRunner.query(`
      ALTER TABLE "clan_warehouses" ADD CONSTRAINT "FK_clan_id_warehouse" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "clan_warehouses" ADD CONSTRAINT "FK_item_id_warehouse" FOREIGN KEY ("item_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clan_warehouses" DROP CONSTRAINT IF EXISTS "FK_item_id_warehouse";
    `);
    await queryRunner.query(`
      ALTER TABLE "clan_warehouses" DROP CONSTRAINT IF EXISTS "FK_clan_id_warehouse";
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "clan_warehouses";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inventory_clan_type_enum";`);
  }
}
