import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSpinRewardToItem1763716000000
  implements MigrationInterface
{
  name = 'AddIsSpinRewardToItem1763716000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE item
      ADD COLUMN is_spin_reward BOOLEAN NOT NULL DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE item
      DROP COLUMN is_spin_reward;
    `);
  }
}
