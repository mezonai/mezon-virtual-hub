import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSkinSetIntoUser1742305411333 implements MigrationInterface {
  name = 'AddSkinSetIntoUser1742305411333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'skin_set',
        type: 'text',
        isArray: true,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'skin_set');
  }
}
