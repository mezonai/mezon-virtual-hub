import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClanRequestTable1760331710590 implements MigrationInterface {
  name = 'CreateClanRequestTable1760331710590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clan_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clan_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "processed_at" TIMESTAMP,
        "processed_by" uuid,
        CONSTRAINT "PK_clan_requests_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "clan_requests" ADD CONSTRAINT "FK_clan_requests_clan" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clan_requests" ADD CONSTRAINT "FK_clan_requests_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clan_requests" DROP CONSTRAINT "FK_clan_requests_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clan_requests" DROP CONSTRAINT "FK_clan_requests_clan"`,
    );
    await queryRunner.query(`DROP TABLE "clan_requests"`);
  }
}
