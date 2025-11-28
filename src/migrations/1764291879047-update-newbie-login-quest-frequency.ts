import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNewbieLoginQuestFrequency1764291879047
  implements MigrationInterface
{
  name = 'UpdateNewbieLoginQuestFrequency1764291879047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "quests"
      SET "frequency" = 'once'
      WHERE "type" IN ('newbie_login', 'newbie_login_special');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "quests"
      SET "frequency" = 'daily'
      WHERE "type" IN ('newbie_login', 'newbie_login_special');
    `);
  }
}
