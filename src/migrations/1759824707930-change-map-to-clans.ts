import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMapToClans1759824707930 implements MigrationInterface {
  name = 'ChangeMapToClans1759824707930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('map', 'clans');

    await queryRunner.query(`
      ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "FK_user_map";
    `);

    await queryRunner.query(`
      ALTER TABLE "user" RENAME COLUMN "map_id" TO "clan_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_clan"
      FOREIGN KEY ("clan_id") REFERENCES "clans"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`ALTER TABLE "clans" ADD "description" text`);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD COLUMN "fund" integer NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD COLUMN "score" integer NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD COLUMN "max_members" integer NOT NULL DEFAULT 20;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD COLUMN "leader_id" uuid NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD COLUMN "vice_leader_id" uuid NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD CONSTRAINT "FK_clans_leader_id"
      FOREIGN KEY ("leader_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD CONSTRAINT "FK_clans_vice_leader_id"
      FOREIGN KEY ("vice_leader_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clans" DROP CONSTRAINT IF EXISTS "FK_clans_vice_leader_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP CONSTRAINT IF EXISTS "FK_clans_leader_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP COLUMN IF EXISTS "vice_leader_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP COLUMN IF EXISTS "leader_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP COLUMN IF EXISTS "max_members";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP COLUMN IF EXISTS "score";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP COLUMN IF EXISTS "fund";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP COLUMN IF EXISTS "description";
    `);

    await queryRunner.query(`
      ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "FK_user_clan";
    `);

    await queryRunner.query(`
      ALTER TABLE "user" RENAME COLUMN "clan_id" TO "map_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_map"
      FOREIGN KEY ("map_id") REFERENCES "clans"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans" DROP CONSTRAINT IF EXISTS "FK_clans_leader_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "clans" DROP CONSTRAINT IF EXISTS "FK_clans_vice_leader_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD CONSTRAINT "FK_maps_leader_id"
      FOREIGN KEY ("leader_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "clans"
      ADD CONSTRAINT "FK_maps_vice_leader_id"
      FOREIGN KEY ("vice_leader_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);

    await queryRunner.renameTable('clans', 'map');
  }
}
