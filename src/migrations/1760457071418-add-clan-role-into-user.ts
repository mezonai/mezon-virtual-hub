import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClanRoleIntoUser1760457071418 implements MigrationInterface {
  name = 'AddClanRoleIntoUser1760457071418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clans" DROP CONSTRAINT "FK_clans_vice_leader_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clans" DROP CONSTRAINT "FK_clans_leader_id"`,
    );
    await queryRunner.query(`ALTER TABLE "clans" DROP COLUMN "map_key"`);
    await queryRunner.query(`DROP TYPE "public"."clans_map_key_enum"`);
    await queryRunner.query(`ALTER TABLE "clans" DROP COLUMN "leader_id"`);
    await queryRunner.query(`ALTER TABLE "clans" DROP COLUMN "vice_leader_id"`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_clan_role_enum" AS ENUM('leader', 'vice_leader', 'member')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "clan_role" "public"."user_clan_role_enum" NOT NULL DEFAULT 'member'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_clan_vice_leader" ON "user" ("clan_id") WHERE "clan_role" = 'vice_leader' AND "clan_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_clan_leader" ON "user" ("clan_id") WHERE "clan_role" = 'leader' AND "clan_id" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_clan_leader"`);
    await queryRunner.query(`DROP INDEX "public"."UQ_clan_vice_leader"`);
    await queryRunner.query(
      `ALTER TABLE "clan_funds" ADD CONSTRAINT "UQ_clan_funds_type" UNIQUE ("clan_id", "type")`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "clan_role"`);
    await queryRunner.query(`DROP TYPE "public"."user_clan_role_enum"`);
    await queryRunner.query(`ALTER TABLE "clans" ADD "vice_leader_id" uuid`);
    await queryRunner.query(`ALTER TABLE "clans" ADD "leader_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "clans" ADD CONSTRAINT "FK_clans_leader_id" FOREIGN KEY ("leader_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clans" ADD CONSTRAINT "FK_clans_vice_leader_id" FOREIGN KEY ("vice_leader_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
