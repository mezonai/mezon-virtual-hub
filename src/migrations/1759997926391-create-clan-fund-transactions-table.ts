import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClanFundTransactionsTable1759997926391
  implements MigrationInterface
{
  name = 'CreateClanFundTransactionsTable1759997926391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "clan_fund_transactions" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "clan_id" uuid NOT NULL,
            "user_id" uuid,
            "type" "public"."clan_funds_type_enum" NOT NULL,
            "amount" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_clan_fund_transactions_id" PRIMARY KEY ("id")
        )
    `);

    await queryRunner.query(
      `ALTER TABLE "clan_fund_transactions" ADD CONSTRAINT "FK_clan_fund_transactions_clan_id" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clan_fund_transactions" ADD CONSTRAINT "FK_clan_fund_transactions_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clan_fund_transactions" DROP CONSTRAINT "FK_clan_fund_transactions_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clan_fund_transactions" DROP CONSTRAINT "FK_clan_fund_transactions_clan_id"`,
    );
    await queryRunner.query(`DROP TABLE "clan_fund_transactions"`);
  }
}
