import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFarmWarehouseTable1761274439296
  implements MigrationInterface
{
  name = 'CreateFarmWarehouseTable1761274439296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "farm_warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "farm_id" uuid NOT NULL, "plant_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_harvested" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_farm_warehouse_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm_warehouses" ADD CONSTRAINT "FK_farm_id_warehouse" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm_warehouses" ADD CONSTRAINT "FK_plant_id_warehouse" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "farm_warehouses" DROP CONSTRAINT "FK_plant_id_warehouse"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm_warehouses" DROP CONSTRAINT "FK_farm_id_warehouse"`,
    );
    await queryRunner.query(`DROP TABLE "farm_warehouses"`);
  }
}
