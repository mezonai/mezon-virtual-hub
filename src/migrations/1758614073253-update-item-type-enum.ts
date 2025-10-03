import { Gender, ItemCode, ItemType } from '@enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateItemTypeEnum1758614073253 implements MigrationInterface {
  name = 'UpdateItemTypeEnum1758614073253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE item 
      ALTER COLUMN type TYPE varchar(50) USING type::varchar;
    `);

    await queryRunner.query(`
      INSERT INTO "item" ("name", "gender", "gold", "type", "item_code", "is_stackable", "is_purchasable")
      VALUES
        ('Thẻ Nâng Cấp Hiếm Thường', ${Gender.NOT_SPECIFIED}, 0, ${ItemType.PET_CARD}, '${ItemCode.RARITY_CARD_RARE}', true, false),
        ('Thẻ Nâng Cấp Hiếm', ${Gender.NOT_SPECIFIED}, 0, ${ItemType.PET_CARD}, '${ItemCode.RARITY_CARD_EPIC}', true, false),
        ('Thẻ Nâng Cấp Siêu Hiếm', ${Gender.NOT_SPECIFIED}, 0, ${ItemType.PET_CARD}, '${ItemCode.RARITY_CARD_LEGENDARY}', true, false)
    `);

    await queryRunner.query(`
      UPDATE item SET type = '${ItemType.HAIR}'       WHERE type = '1';
      UPDATE item SET type = '${ItemType.HAT}'        WHERE type = '2';
      UPDATE item SET type = '${ItemType.FACE}'       WHERE type = '3';
      UPDATE item SET type = '${ItemType.EYES}'       WHERE type = '4';
      UPDATE item SET type = '${ItemType.UPPER}'      WHERE type = '5';
      UPDATE item SET type = '${ItemType.LOWER}'      WHERE type = '6';
      UPDATE item SET type = '${ItemType.GLASSES}'    WHERE type = '7';
      UPDATE item SET type = '${ItemType.PET_CARD}'   WHERE type = '8';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE item SET type = '1' WHERE type = '${ItemType.HAIR}';
      UPDATE item SET type = '2' WHERE type = '${ItemType.HAT}';
      UPDATE item SET type = '3' WHERE type = '${ItemType.FACE}';
      UPDATE item SET type = '4' WHERE type = '${ItemType.EYES}';
      UPDATE item SET type = '5' WHERE type = '${ItemType.UPPER}';
      UPDATE item SET type = '6' WHERE type = '${ItemType.LOWER}';
      UPDATE item SET type = '7' WHERE type = '${ItemType.GLASSES}';
      UPDATE item SET type = '8' WHERE type = '${ItemType.PET_CARD}';
    `);
  }
}
