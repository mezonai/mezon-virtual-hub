import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePriceCatchRateBonusFood1749646042285
  implements MigrationInterface
{
  name = 'UpdatePriceCatchRateBonusFood1749646042285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE food
      SET price = 30, catch_rate_bonus = 1
      WHERE type = 'normal';
    `);

    await queryRunner.query(`
      UPDATE food
      SET price = 100, catch_rate_bonus = 3
      WHERE type = 'premium';
    `);

    await queryRunner.query(`
      UPDATE food
      SET price = 500, catch_rate_bonus = 10
      WHERE type = 'ultra-premium';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE food
      SET price = 200, catch_rate_bonus = 2
      WHERE type IN ('normal', 'premium', 'ultra-premium');
    `);
  }
}
