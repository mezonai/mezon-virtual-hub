import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveHarvestCountMaxFromSlotPlants1766450974651
  implements MigrationInterface
{
  name = 'RemoveHarvestCountMaxFromSlotPlants1766450974651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE slot_plants
        DROP COLUMN harvest_count_max`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE slot_plants
        ADD COLUMN harvest_count_max INT NOT NULL DEFAULT 100`);
  }
}
