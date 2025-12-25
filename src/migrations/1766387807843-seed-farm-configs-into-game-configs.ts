import { FARM_CONFIG } from '@constant/farm.constant';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedFarmConfigsIntoGameConfigs1766387807843
  implements MigrationInterface
{
  name = 'SeedFarmConfigsIntoGameConfigs1766387807843';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO game_configs (key, name, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (key) DO NOTHING
    `,
      ['farm.config', 'Farm config', JSON.stringify(FARM_CONFIG)],
    );
  }

  async down(): Promise<void> {}
}
