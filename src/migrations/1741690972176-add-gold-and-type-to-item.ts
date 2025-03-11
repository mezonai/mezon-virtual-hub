import { ItemType } from '@enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGoldAndTypeToItem1741690972176 implements MigrationInterface {
  name = 'AddGoldAndTypeToItem1741690972176';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('item', [
      new TableColumn({
        name: 'gold',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
      new TableColumn({
        name: 'type',
        type: 'int',
        isNullable: false,
        isUnique: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('item', 'type');
    await queryRunner.dropColumn('item', 'gold');
  }
}
