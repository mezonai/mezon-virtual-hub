import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFkFarmSlotToSlotPlant1761275270213
  implements MigrationInterface
{
  name = 'AddFkFarmSlotToSlotPlant1761275270213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "farm_slots"
      ADD CONSTRAINT "FK_farmslot_slotplant"
      FOREIGN KEY ("current_slot_plant_id")
      REFERENCES "slot_plants"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "farm_slots"
      DROP CONSTRAINT "FK_farmslot_slotplant"
    `);
  }
}
