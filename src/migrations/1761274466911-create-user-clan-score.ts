import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserClanScore1761274466911 implements MigrationInterface {
  name = 'CreateUserClanScore1761274466911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_clant_scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "clan_id" uuid, "total_score" integer NOT NULL DEFAULT '0', "weekly_score" integer NOT NULL DEFAULT '0', "last_reset_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_user_clant_scores_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clant_scores" ADD CONSTRAINT "FK_3bec0865cd2b57a204d77e2d99e" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clant_scores" ADD CONSTRAINT "FK_5e6c5a978dda7c3c5840d49ea8d" FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_clant_scores" DROP CONSTRAINT "FK_5e6c5a978dda7c3c5840d49ea8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_clant_scores" DROP CONSTRAINT "FK_3bec0865cd2b57a204d77e2d99e"`,
    );
    await queryRunner.query(`DROP TABLE "user_clant_scores"`);
  }
}
