import { ItemType } from '@enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeedItemsData1741693279840 implements MigrationInterface {
  name = 'AddSeedItemsData1741693279840';
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [key, value] of Object.entries(ItemType)) {
      if (!isNaN(Number(value))) {
        await queryRunner.query(
          `INSERT INTO item (id, name, type, gold, description, width, height, is_equippable, is_static, created_at, updated_at) 
             VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, now(), now())`,
          [key, value, 0, `Default ${key} item`, 0, 0, false, false],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM item WHERE type IN (${Object.values(ItemType).join(',')})`,
    );
  }
}
