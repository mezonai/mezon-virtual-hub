import { ItemCode } from '@enum';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNewItemAndCheckIsSpinRewardItem1765873683052
  implements MigrationInterface
{
  name = 'SeedNewItemAndCheckIsSpinRewardItem1765873683052';

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
        `
      SELECT 1
      FROM item
      WHERE id = $1
         OR name = $2
      `,
        [item.id, item.name],
      );

      if (exists.length > 0) {
        console.warn(`⚠️ Item đã tồn tại (skip): ${item.name}`);
        continue;
      }

      await queryRunner.query(
        `
      INSERT INTO item (
        id,
        name,
        type,
        gold,
        gender,
        item_code,
        is_stackable,
        is_purchasable,
        is_spin_reward,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        false,
        true,
        false,
        NOW(),
        NOW()
      )
      `,
        [
          item.id,
          item.name,
          item.type,
          item.gold,
          item.gender,
          item.item_code ?? null,
        ],
      );
    }

    // ✅ Update spin reward (trừ rarity card)
    await queryRunner.query(`
    UPDATE item
    SET
      is_spin_reward = true,
      updated_at = NOW()
    WHERE is_spin_reward = false
      AND (
        item_code NOT IN (
          '${ItemCode.RARITY_CARD_LEGENDARY}',
          '${ItemCode.RARITY_CARD_RARE}',
          '${ItemCode.RARITY_CARD_EPIC}'
        )
        OR item_code IS NULL
      )
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/item-seeds.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');

    const items: { id: string }[] = JSON.parse(fileData);

    await queryRunner.query(
      `
    DELETE FROM item
    WHERE id = ANY($1)
    `,
      [items.map((i) => i.id)],
    );
  }
}
