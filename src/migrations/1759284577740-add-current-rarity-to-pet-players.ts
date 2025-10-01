import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrentRarityToPetPlayers1759284577740
  implements MigrationInterface
{
  name = 'AddCurrentRarityToPetPlayers1759284577740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD "current_rarity" "public"."pets_rarity_enum" NOT NULL DEFAULT 'common'`,
    );

    await queryRunner.query(`
      UPDATE "pet_players" pp
      SET current_rarity = p.rarity
      FROM pets p
      WHERE pp.pet_id = p.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP COLUMN "current_rarity"`,
    );
  }
}
