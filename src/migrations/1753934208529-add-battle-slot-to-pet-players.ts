import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBattleSlotToPetPlayers1753934208529
  implements MigrationInterface
{
  name = 'AddBattleSlotToPetPlayers1753934208529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP COLUMN "is_selected_battle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD "battle_slot" integer NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_pet_players_user_battle_slot"
      ON "pet_players" ("user_id", "battle_slot")
      WHERE "battle_slot" > 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_pet_players_user_battle_slot"
    `);
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP COLUMN "battle_slot"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD "battle_slot" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" RENAME COLUMN "battle_slot" TO "is_selected_battle"`,
    );
  }
}
