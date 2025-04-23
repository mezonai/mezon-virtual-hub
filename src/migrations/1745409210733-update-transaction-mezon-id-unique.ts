import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

export class UpdateTransactionMezonIdUnique1745409210733
  implements MigrationInterface
{
  name = 'UpdateTransactionMezonIdUnique1745409210733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM transaction t1
      USING transaction t2
      WHERE t1.id > t2.id
        AND t1.mezon_transaction_id IS NOT NULL
        AND t2.mezon_transaction_id IS NOT NULL
        AND t1.mezon_transaction_id = t2.mezon_transaction_id;
    `);

    await queryRunner.createUniqueConstraint(
      'transaction',
      new TableUnique({
        name: 'UQ_mezon_transaction_id',
        columnNames: ['mezon_transaction_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint(
      'transaction',
      'UQ_mezon_transaction_id',
    );
  }
}
