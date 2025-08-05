import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1754301165058 implements MigrationInterface {
  name = 'AddUserRole1754301165058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" integer NOT NULL DEFAULT '0'`,
    );

    const adminUsernames = (process.env.ADMIN_BYPASS_USERS || '')
      .split(',')
      .map((username) => username.trim())
      .filter(Boolean);

    if (adminUsernames.length > 0) {
      const usernamesString = adminUsernames.map((u) => `'${u}'`).join(', ');
      await queryRunner.query(`
        UPDATE "user"
        SET "role" = 1
        WHERE "username" IN (${usernamesString})
      `);
    }

    // Refactor user table
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "position_x" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "position_y" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "gender" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "gender" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "position_y" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "position_x" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
  }
}
