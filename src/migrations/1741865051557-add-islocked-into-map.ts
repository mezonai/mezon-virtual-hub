import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIslockedIntoMap1741865051557 implements MigrationInterface {
  name = 'AddIslockedIntoMap1741865051557';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('map', [
      new TableColumn({
        name: 'is_locked',
        type: 'boolean',
        default: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('map', 'is_locked');
  }
}
