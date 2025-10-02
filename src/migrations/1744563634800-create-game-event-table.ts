import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGameEventTable1744563634800 implements MigrationInterface {
  name = 'CreateGameEventTable1744563634800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "game_event" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "target_user_id" uuid,
        "is_completed" BOOLEAN NOT NULL DEFAULT false,
        "max_completed_users" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP NULL,
        CONSTRAINT "PK_game_event_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_game_event_target_user" FOREIGN KEY ("target_user_id") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "event_completed_users" (
        "event_id" uuid NOT NULL,
        "completed_user_id" uuid NOT NULL,
        CONSTRAINT "PK_event_completed_users" PRIMARY KEY ("event_id", "completed_user_id"),
        CONSTRAINT "FK_event_completed_event" FOREIGN KEY ("event_id") REFERENCES "game_event"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_event_completed_user" FOREIGN KEY ("completed_user_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "event_completed_users" DROP CONSTRAINT "FK_event_completed_user"`,
    );
    await queryRunner.query(`DROP TABLE "event_completed_users"`);
    await queryRunner.query(`DROP TABLE "game_event"`);
  }
}
