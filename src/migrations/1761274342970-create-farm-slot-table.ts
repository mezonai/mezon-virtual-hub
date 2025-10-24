import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFarmSlotTable1761274342970 implements MigrationInterface {
  name = 'CreateFarmSlotTable1761274342970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "farm_slots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "farm_id" uuid NOT NULL, "slot_index" integer NOT NULL, "current_slot_plant_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_farm_slot_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm_slots" ADD CONSTRAINT "FK_farm_slot_farm" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "farm_slots" DROP CONSTRAINT "FK_farm_slot_farm"`,
    );
    await queryRunner.query(`DROP TABLE "farm_slots"`);
  }
}
