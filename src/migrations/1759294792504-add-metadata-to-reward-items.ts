import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetadataToRewardItems1759294792504
  implements MigrationInterface
{
  name = 'AddMetadataToRewardItems1759294792504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reward_items" ADD "metadata" jsonb NULL`,
    );

    // Optionally migrate existing pet_id into metadata for safety
    await queryRunner.query(`
        UPDATE "reward_items" ri
        SET metadata = jsonb_build_object('rarity', p.rarity)
        FROM pets p
        WHERE ri.pet_id = p.id
            AND ri.type = 'pet'
            AND ri.pet_id IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reward_items" DROP COLUMN "metadata"`,
    );
  }
}
