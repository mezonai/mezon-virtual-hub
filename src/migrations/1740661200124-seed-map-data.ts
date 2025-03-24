import { MapKey } from '@enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class SeedMapData1740661200124 implements MigrationInterface {
  name = 'SeedMapData1740661200124';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "map" ("name", "map_key") VALUES
      ('Ha Noi 1', '${MapKey.HN1}'),
      ('Ha Noi 2', '${MapKey.HN2}'),
      ('Ha Noi 3', '${MapKey.HN3}'),
      ('Vinh', '${MapKey.VINH}'),
      ('Da Nang', '${MapKey.DN}'),
      ('Quy Nhon', '${MapKey.QN}'),
      ('Sai Gon', '${MapKey.SG}');
    `);

    await queryRunner.query(`
      UPDATE "map" SET default_position_x = 637, default_position_y = 182 
      WHERE map_key = '${MapKey.SG}';
    `);

    await queryRunner.query(`
      UPDATE "map" SET default_position_x = 0, default_position_y = -965 
      WHERE map_key = '${MapKey.HN1}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const mapKeys = Object.values(MapKey)
      .map((key) => `'${key}'`)
      .join(', ');
    await queryRunner.query(
      `DELETE FROM "map" WHERE "map_key" IN (${mapKeys})`,
    );
  }
}
