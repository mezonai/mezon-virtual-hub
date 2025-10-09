import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClanFundTable1759997229931 implements MigrationInterface {
  name = 'CreateClanFundTable1759997229931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."clan_funds_type_enum" AS ENUM('gold', 'diamond')`,
    );
    await queryRunner.query(
      `CREATE TABLE "clan_funds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clan_id" uuid NOT NULL, "type" "public"."clan_funds_type_enum" NOT NULL,
        "amount" integer NOT NULL DEFAULT '0',
        CONSTRAINT "UQ_clan_funds_type" UNIQUE ("clan_id", "type"),
        CONSTRAINT "PK_clan_funds_id" PRIMARY KEY ("id")
       )`,
    );
    await queryRunner.query(
      `ALTER TABLE "clan_funds" ADD CONSTRAINT "FK_clan_funds_clan_id" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clan_funds" DROP CONSTRAINT "FK_clan_funds_clan_id"`,
    );
    await queryRunner.query(`DROP TABLE "clan_funds"`);
    await queryRunner.query(`DROP TYPE "public"."clan_funds_type_enum"`);
  }
}
