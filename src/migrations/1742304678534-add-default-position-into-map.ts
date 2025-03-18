import { Gender, MapKey } from '@enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDefaultPositionIntoMap1742304678534
  implements MigrationInterface
{
  name = 'AddDefaultPositionIntoMap1742304678534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'map',
      new TableColumn({
        name: 'default_position_x',
        type: 'int',
        default: 0,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'map',
      new TableColumn({
        name: 'default_position_y',
        type: 'int',
        default: 0,
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `UPDATE map SET default_position_x = 637, default_position_y = 182 WHERE map_key = '${MapKey.SG}'`,
    );

    await queryRunner.query(
      `UPDATE map SET default_position_x = 0, default_position_y = -965 WHERE map_key = '${MapKey.HN1}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('map', 'default_position_x');
    await queryRunner.dropColumn('map', 'default_position_y');
  }
}
