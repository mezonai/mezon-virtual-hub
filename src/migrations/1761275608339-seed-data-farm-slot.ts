import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDataFarmSlot1761275608339 implements MigrationInterface {
  name = 'SeedDataFarmSlot1761275608339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const farms = await queryRunner.query(`SELECT id FROM farms;`);
    if (!farms.length) {
      return;
    }

    for (const farm of farms) {
      const farmId = farm.id;

      const [{ count }] = await queryRunner.query(
        `SELECT COUNT(*)::int AS count FROM farm_slots WHERE farm_id = $1;`,
        [farmId],
      );

      if (count >= 60) {
        continue;
      }

      await queryRunner.query(
        `
        INSERT INTO farm_slots (farm_id, slot_index, created_at, updated_at)
        SELECT $1, gs.n, NOW(), NOW()
        FROM generate_series(1, 60) AS gs(n);
        `,
        [farmId],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM farm_slots;`);
  }
}
