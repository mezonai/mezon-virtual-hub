import { MapKey } from '@enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMapKeyAndSeed1740661200124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'map',
      new TableColumn({
        name: 'map_key',
        type: 'enum',
        enum: Object.values(MapKey),
        isUnique: true,
      }),
    );

    await queryRunner.query(`
      INSERT INTO "map" ("name", "map_key", "width", "height", "created_at", "updated_at") VALUES
      ('Ha Noi 1', '${MapKey.HN1}', 1000, 1000, NOW(), NOW()),
      ('Ha Noi 2', '${MapKey.HN2}', 1000, 1000, NOW(), NOW()),
      ('Ha Noi 3', '${MapKey.HN3}', 1000, 1000, NOW(), NOW()),
      ('Vinh', '${MapKey.VINH}', 1000, 1000, NOW(), NOW()),
      ('Da Nang', '${MapKey.DN}', 1000, 1000, NOW(), NOW()),
      ('Quy Nhon', '${MapKey.QN}', 1000, 1000, NOW(), NOW()),
      ('Sai Gon', '${MapKey.SG}', 1000, 1000, NOW(), NOW());
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const mapKeys = Object.values(MapKey).map((key) => `'${key}'`).join(', ');
    await queryRunner.query(
      `DELETE FROM "map" WHERE "map_key" IN (${mapKeys})`,
    );

    await queryRunner.dropColumn('map', 'map_key');
  }
}
