import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsToTransactions1754392852168
  implements MigrationInterface
{
  name = 'AddFieldsToTransactions1754392852168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('transaction', 'transactions');

    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "sender_id" DROP NOT NULL`,
    );

    await queryRunner.query(`
      ALTER TABLE "transactions"
      RENAME COLUMN "sender_id" TO "user_id"
    `);

    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM ('buy', 'withdraw', 'deposit')
    `);
    await queryRunner.query(`
      CREATE TYPE "transaction_currency_enum" AS ENUM ('token', 'gold', 'diamond')
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD "type" "transaction_type_enum",
      ADD "currency" "transaction_currency_enum",
      ADD "inventory_id" uuid
    `);

    await queryRunner.query(`
      UPDATE "transactions"
      SET "type" = 'deposit',
          "currency" = 'token'
      WHERE "type" IS NULL OR "currency" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "type" SET NOT NULL,
      ALTER COLUMN "currency" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_inventory" FOREIGN KEY ("inventory_id")
      REFERENCES "inventory"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "created_at" SET DEFAULT now(),
      ALTER COLUMN "created_at" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "created_at" DROP DEFAULT now(),
      ALTER COLUMN "created_at" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP CONSTRAINT "FK_transactions_inventory"
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP COLUMN "type",
      DROP COLUMN "currency",
      DROP COLUMN "inventory_id"
    `);

    await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "transaction_currency_enum"`);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      RENAME COLUMN "user_id" TO "sender_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "sender_id" SET NOT NULL
    `);

    await queryRunner.renameTable('transactions', 'transaction');
  }
}
