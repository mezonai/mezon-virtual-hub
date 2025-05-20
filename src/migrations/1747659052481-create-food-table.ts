import { InventoryType, PurchaseMethod } from '@enum';
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateFoodTable1747659052481 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "purchase_method_enum" AS ENUM('${PurchaseMethod.GOLD}', '${PurchaseMethod.DIAMOND}', '${PurchaseMethod.SLOT}')`
    );

    await queryRunner.createTable(
      new Table({
        name: 'food',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'purchase_method',
            type: 'purchase_method_enum',
          },
          {
            name: 'price',
            type: 'int',
            default: 0,
          },
          {
            name: 'catch_rate_bonus',
            type: 'float',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.query(`ALTER TABLE "inventory" ADD COLUMN "food_id" uuid NULL`);

    await queryRunner.createForeignKey(
      'inventory',
      new TableForeignKey({
        columnNames: ['food_id'],
        referencedTableName: 'food',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    const inventoryTable = await queryRunner.getTable('inventory');
    const itemForeignKey = inventoryTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes('item_id'),
    );
    if (itemForeignKey) {
      await queryRunner.dropForeignKey('inventory', itemForeignKey);
    }

    await queryRunner.changeColumn(
      'inventory',
      'item_id',
      new TableColumn({
        name: 'item_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `CREATE TYPE "inventory_type_enum" AS ENUM('${InventoryType.FOOD}', '${InventoryType.ITEM}')`
    );

    await queryRunner.addColumn(
      'inventory',
      new TableColumn({
        name: 'inventory_type',
        type: 'inventory_type_enum',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `UPDATE "inventory" SET "inventory_type" = '${InventoryType.ITEM}' WHERE "item_id" IS NOT NULL`
    );

    await queryRunner.changeColumn(
      'inventory',
      'inventory_type',
      new TableColumn({
        name: 'inventory_type',
        type: 'inventory_type_enum',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('inventory', 'inventory_type');

    await queryRunner.changeColumn(
      'inventory',
      'item_id',
      new TableColumn({
        name: 'item_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    const table = await queryRunner.getTable('inventory');
    const foodForeignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('food_id'));
    if (foodForeignKey) {
      await queryRunner.dropForeignKey('inventory', foodForeignKey);
    }

    await queryRunner.query(`ALTER TABLE "inventory" DROP COLUMN "food_id"`);

    await queryRunner.dropTable('food');

    await queryRunner.query(`DROP TYPE "purchase_method_enum"`);
  }
}

