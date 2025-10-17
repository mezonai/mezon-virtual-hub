import { configEnv } from '@config/env.config';
import { UserEntity } from '@modules/user/entity/user.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMezonBotUser1755768582534 implements MigrationInterface {
  name = 'SeedMezonBotUser1755768582534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const mezonId = process.env.MEZON_TOKEN_RECEIVER_APP_ID;

    if (!mezonId) {
      throw new Error(
        '⚠️ Missing environment variable: MEZON_TOKEN_RECEIVER_APP_ID',
      );
    }

    await queryRunner.query(
      `
      INSERT INTO "user" (
        username,
        mezon_id,
        display_name
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING;
      `,
      ['mezon_bot', mezonId, 'Virtual-Hub'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM "user" 
            WHERE username = 'mezon_bot'
        `);
  }
}
