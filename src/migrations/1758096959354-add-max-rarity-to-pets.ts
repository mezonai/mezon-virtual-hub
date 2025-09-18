import { PETS_RARITY_ENUM } from '@constant';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaxRarityToPets1758096959354 implements MigrationInterface {
  name = 'AddMaxRarityToPets1758096959354';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pets" ADD "max_rarity" "public"."${PETS_RARITY_ENUM}" NOT NULL DEFAULT 'legendary'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pets" DROP COLUMN "max_rarity"`);
  }
}
