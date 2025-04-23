import { Gender, ItemType } from '@enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedItemData1742788855483 implements MigrationInterface {
  name = 'SeedItemData1742788855483';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "item" ("name", "gold", "is_equippable", "is_static", "gender", "type")
      VALUES
      ('Spiky Hair', 1, true, false, '${Gender.MALE}', ${ItemType.Hair}),
      ('Blue Tank Top', 1, true, false, '${Gender.MALE}', ${ItemType.Upper}),
      ('Blue Short', 1, true, false, '${Gender.MALE}', ${ItemType.Lower}),
      ('V-Line Face', 1, true, false, '${Gender.NOT_SPECIFIED}', ${ItemType.Face}),
      ('Fat Face', 1, true, false, '${Gender.NOT_SPECIFIED}', ${ItemType.Face});
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "item" WHERE "name" IN (
        'Spiky Hair',
        'Blue Tank Top',
        'Blue Short',
        'V-Line Face',
        'Fat Face'
      );
    `);
  }
}
