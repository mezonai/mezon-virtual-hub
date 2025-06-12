import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasFirstRewardToUser1749626836620
  implements MigrationInterface
{
  name = 'AddHasFirstRewardToUser1749626836620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "has_first_reward" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "has_first_reward"`,
    );
  }
}
