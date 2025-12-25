import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveViceLeaderUnique1766128879673 implements MigrationInterface {
    name = 'RemoveViceLeaderUnique1766128879673';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DROP INDEX IF EXISTS "public"."UQ_clan_vice_leader";
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_clan_vice_leader"
      ON "user" ("clan_id")
      WHERE "clan_role" = 'vice_leader'
        AND "clan_id" IS NOT NULL;
    `);
    }
}
