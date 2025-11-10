import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedClanWarehouse1762764255108 implements MigrationInterface {
  name = 'SeedClanWarehouse1762764255108';

 public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE clan_warehouses
      ADD CONSTRAINT uq_clan_item_harvest UNIQUE (clan_id, item_id, is_harvested);
    `);

    await queryRunner.query(`
      INSERT INTO clan_warehouses (clan_id, item_id, quantity, is_harvested, created_at, updated_at)
      SELECT c.id, p.id, 5, false, NOW(), NOW()
      FROM clans c
      CROSS JOIN plants p
      WHERE p.name IN ('Broccoli','Chilli','Corn','Eggplant','Garlic','Potato','Pumpkin','Strawberry','Watermelon','Grape')
      ON CONFLICT (clan_id, item_id, is_harvested) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM clan_warehouses
      WHERE quantity = 5
        AND is_harvested = false
        AND item_id IN (
          SELECT id FROM plants
          WHERE name IN ('Broccoli','Chilli','Corn','Eggplant','Garlic','Potato','Pumpkin','Strawberry','Watermelon','Grape')
        );
    `);

    await queryRunner.query(`
      ALTER TABLE clan_warehouses
      DROP CONSTRAINT IF EXISTS uq_clan_item_harvest;
    `);
  }
}
