import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGoldIntoUser1741694420134 implements MigrationInterface {
  name = 'AddGoldIntoUser1741694420134';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'gold',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'gold');
  }
}
