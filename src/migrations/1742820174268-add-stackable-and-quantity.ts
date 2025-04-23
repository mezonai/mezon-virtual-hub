import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStackableAndQuantity1742820174268
  implements MigrationInterface
{
  name = 'AddStackableAndQuantity1742820174268';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'item',
      new TableColumn({
        name: 'is_stackable',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'inventory',
      new TableColumn({
        name: 'quantity',
        type: 'int',
        default: 1,
      }),
    );

    await queryRunner.addColumn(
      'inventory',
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      }),
    );

    await queryRunner.addColumn(
      'inventory',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'inventory',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('item', 'is_stackable');
    await queryRunner.dropColumn('inventory', 'quantity');
    await queryRunner.dropColumn('inventory', 'created_at');
    await queryRunner.dropColumn('inventory', 'updated_at');
    await queryRunner.dropColumn('inventory', 'deleted_at');
  }
}
