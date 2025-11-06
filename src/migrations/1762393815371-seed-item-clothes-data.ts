import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedItemClothesData1762393815371 implements MigrationInterface {
  name = 'SeedItemClothesData1762393815371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/item-seeds.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const items: {
      id: string;
      name: string;
      type: string;
      gold: number;
      gender: string;
      item_code?: string | null;
    }[] = JSON.parse(fileData);

    for (const item of items) {
      const exists = await queryRunner.query(
        `SELECT id FROM item WHERE id = $1 OR (item_code IS NOT NULL AND item_code = $2)`,
        [item.id, item.item_code],
      );

      if (exists.length > 0) {
        console.warn(`⚠️  Item đã tồn tại: ${item.name}`);
        continue;
      }
      await queryRunner.query(
        `
        INSERT INTO item (id, name, type, gold, gender, item_code)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [item.id, item.name, item.type, item.gold, item.gender, item.item_code],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/item-seeds.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const items: { id: string }[] = JSON.parse(fileData);

    for (const item of items) {
      await queryRunner.query(`DELETE FROM item WHERE id = $1`, [item.id]);
      console.log(`🗑️ Deleted seed item: ${item.id}`);
    }
  }
}
