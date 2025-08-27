import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestAndPlayerQuestTable1756202220374
  implements MigrationInterface
{
  name = 'CreateQuestAndPlayerQuestTable1756202220374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "duration_hours" integer NOT NULL,
        "description" text, "type" character varying(50) NOT NULL,
        "frequency" character varying(20) NOT NULL,
        "required_count" integer NOT NULL DEFAULT '1',
        "reward_id" uuid,
        CONSTRAINT "PK_quests_id" PRIMARY KEY ("id")
       )`,
    );

    await queryRunner.query(
      `CREATE TABLE "player_quests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "progress" integer NOT NULL DEFAULT '0',
        "is_completed" boolean NOT NULL DEFAULT false,
        "is_claimed" boolean NOT NULL DEFAULT false,
        "completed_at" TIMESTAMP,
        "start_at" TIMESTAMP,
        "end_at" TIMESTAMP,
        "quest_id" uuid,
        "user_id" uuid,
        CONSTRAINT "PK_player_quests_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "quests" ADD CONSTRAINT "FK_quests_reward_id" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_quests" ADD CONSTRAINT "FK_player_quests_quest_id" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_quests" ADD CONSTRAINT "FK_player_quests_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_quests" DROP CONSTRAINT "FK_player_quests_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_quests" DROP CONSTRAINT "FK_player_quests_quest_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quests" DROP CONSTRAINT "FK_quests_reward_id"`,
    );
    await queryRunner.query(`DROP TABLE "player_quests"`);
    await queryRunner.query(`DROP TABLE "quests"`);
  }
}
