import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDataFarm1761275501147 implements MigrationInterface {
  name = 'SeedDataFarm1761275501147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const clans = await queryRunner.query(`
      SELECT id, name FROM clans WHERE farm_id IS NULL;
    `);

    for (const clan of clans) {
      const clanId = clan.id;
      const farmName = `${clan.name || 'Unnamed'} Farm`;

      const result = await queryRunner.query(
        `
        INSERT INTO farms (clan_id, name, quantity_slot, created_at, updated_at)
        VALUES ($1, $2, 60, NOW(), NOW())
        RETURNING id;
        `,
        [clanId, farmName],
      );

      const farmId = result[0]?.id;
      if (!farmId) continue;

      await queryRunner.query(
        `
        UPDATE clans
        SET farm_id = $1
        WHERE id = $2;
        `,
        [farmId, clanId],
      );

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
    const farms = await queryRunner.query(`
      SELECT id FROM farms WHERE quantity_slot = 60 AND name LIKE '%Farm';
    `);

    if (!farms.length) return;

    const farmIds = farms.map((f: any) => `'${f.id}'`).join(',');

    await queryRunner.query(`
      DELETE FROM farm_slots WHERE farm_id IN (${farmIds});
    `);

    await queryRunner.query(`
      UPDATE clans SET farm_id = NULL WHERE farm_id IN (${farmIds});
    `);

    await queryRunner.query(`
      DELETE FROM farms WHERE id IN (${farmIds});
    `);
  }
}
