import { ItemCode } from '@enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPurchasableIntoItem1758524807533
  implements MigrationInterface
{
  name = 'AddIsPurchasableIntoItem1758524807533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item" ADD "is_purchasable" boolean NOT NULL DEFAULT true`,
    );

    await queryRunner.query(`
      UPDATE "item"
      SET "is_purchasable" = false
      WHERE "item_code" IN (
        '${ItemCode.RARITY_CARD_RARE}',
        '${ItemCode.RARITY_CARD_EPIC}',
        '${ItemCode.RARITY_CARD_LEGENDARY}'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "is_purchasable"`);
  }
}
