import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClanActivity1763614359892 implements MigrationInterface {
  name = 'CreateClanActivity1763614359892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clan_activitys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clan_id" uuid NOT NULL, "user_id" uuid, "action_type" character varying(50) NOT NULL, "item_name" character varying(100), "quantity" integer DEFAULT '0', "amount" integer DEFAULT '0', "office_name" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_clan_activitys_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "clan_activitys"`);
  }
}
