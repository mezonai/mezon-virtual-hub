import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSlotPlantTable1761274414316 implements MigrationInterface {
  name = 'CreateSlotPlantTable1761274414316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "slot_plants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "farm_slot_id" uuid NOT NULL, "plant_id" uuid NOT NULL, "plant_name" character varying NOT NULL, "stage" integer NOT NULL DEFAULT 1, "planted_by" uuid NOT NULL, "last_harvested_by" uuid NOT NULL, "grow_time" integer NOT NULL, "harvest_at" TIMESTAMP, "total_water_count" integer NOT NULL DEFAULT '0', "total_bug_caught" integer NOT NULL DEFAULT '0', "expected_water_count" integer NOT NULL DEFAULT '0', "expected_bug_count" integer NOT NULL DEFAULT '0', "last_watered_at" TIMESTAMP, "need_water_until" TIMESTAMP, "last_bug_caught_at" TIMESTAMP, "bug_until" TIMESTAMP, "harvest_count" integer NOT NULL DEFAULT '0', "harvest_count_max" integer NOT NULL DEFAULT '10', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_slot_plant_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "slot_plants" ADD CONSTRAINT "FK_slotplant_farmslot" FOREIGN KEY ("farm_slot_id") REFERENCES "farm_slots"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "slot_plants" ADD CONSTRAINT "FK_slotplant_plant" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "slot_plants" ADD CONSTRAINT "FK_slotplant_user" FOREIGN KEY ("planted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "slot_plants" DROP CONSTRAINT "FK_slotplant_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "slot_plants" DROP CONSTRAINT "FK_slotplant_plant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "slot_plants" DROP CONSTRAINT "FK_slotplant_farmslot"`,
    );
    await queryRunner.query(`DROP TABLE "slot_plants"`);
  }
}
