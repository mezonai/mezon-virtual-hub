import { MigrationInterface, QueryRunner } from "typeorm";

export class RecreateUserClantStats1761903896977 implements MigrationInterface {
    name = 'RecreateUserClantStats1761903896977'
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "user-clant-scores"`);

        await queryRunner.query(`
            CREATE TABLE "user-clan-stats" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "clan_id" uuid NOT NULL,
                "total_score" integer NOT NULL DEFAULT 0,
                "weekly_score" integer NOT NULL DEFAULT 0,
                "last_reset_at" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "harvest_count" integer NOT NULL DEFAULT 0,
                "harvest_interrupt_count" integer NOT NULL DEFAULT 0,
                "harvest_count_use" integer NOT NULL DEFAULT 0,
                "harvest_interrupt_count_use" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_user_clant_stats_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "user-clan-stats"
            ADD CONSTRAINT "FK_user_stats_user_id" FOREIGN KEY ("user_id") 
            REFERENCES "user"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "user-clan-stats"
            ADD CONSTRAINT "FK_user_stats_clan_id" FOREIGN KEY ("clan_id") 
            REFERENCES "clans"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user-clan-stats" DROP CONSTRAINT "FK_user_stats_clan_id"`);
        await queryRunner.query(`ALTER TABLE "user-clan-stats" DROP CONSTRAINT "FK_user_stats_user_id"`);
        await queryRunner.query(`DROP TABLE "user-clan-stats"`);
    }
}
