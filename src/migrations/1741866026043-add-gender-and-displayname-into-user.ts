import { Gender } from '@enum';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGenderAndDisplaynameIntoUser1741866026043
  implements MigrationInterface
{
  name = 'AddGenderAndDisplaynameIntoUser1741866026043';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'gender',
        type: 'enum',
        enum: Object.values(Gender),
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'display_name',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'gender');
    await queryRunner.dropColumn('user', 'display_name');
  }
}
