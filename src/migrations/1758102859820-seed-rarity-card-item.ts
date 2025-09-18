import { Gender, ItemCode, ItemType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRarityCardItem1758102859820 implements MigrationInterface {
  name = 'SeedRarityCardItem1758102859820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "is_equippable"`);
    await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "is_static"`);
    await queryRunner.query(
      `ALTER TABLE "item" ADD "item_code" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" ADD CONSTRAINT "UQ_item_item_code" UNIQUE ("item_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" ALTER COLUMN "updated_at" SET NOT NULL`,
    );

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into<ItemEntity>('item')
      .values([
        {
          name: 'Thẻ Nâng Cấp Hiếm Thường',
          gender: Gender.NOT_SPECIFIED,
          gold: 0,
          type: ItemType.UpgradeCard,
          item_code: ItemCode.RARITY_CARD_RARE,
          is_stackable: true,
        },
        {
          name: 'Thẻ Nâng Cấp Hiếm',
          gender: Gender.NOT_SPECIFIED,
          gold: 0,
          type: ItemType.UpgradeCard,
          item_code: ItemCode.RARITY_CARD_EPIC,
          is_stackable: true,
        },
        {
          name: 'Thẻ Nâng Cấp Siêu Hiếm',
          gender: Gender.NOT_SPECIFIED,
          gold: 0,
          type: ItemType.UpgradeCard,
          item_code: ItemCode.RARITY_CARD_LEGENDARY,
          is_stackable: true,
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('item')
      .where('item_code IN (:...itemCodes)', {
        itemCodes: [
          ItemCode.RARITY_CARD_LEGENDARY,
          ItemCode.RARITY_CARD_RARE,
          ItemCode.RARITY_CARD_EPIC,
        ],
      })
      .execute();

    await queryRunner.query(
      `ALTER TABLE "item" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" DROP CONSTRAINT "UQ_item_item_code"`,
    );
    await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "item_code"`);
    await queryRunner.query(
      `ALTER TABLE "item" ADD "is_static" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "item" ADD "is_equippable" boolean DEFAULT false`,
    );
  }
}
