import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRewardAndRewardItemTable1756201000037
  implements MigrationInterface
{
  name = 'CreateRewardAndRewardItemTable1756201000037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rewards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "type" character varying(50) NOT NULL UNIQUE,
        "description" text,
        CONSTRAINT "PK_rewards_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "reward_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying(50) NOT NULL,
        "quantity" integer NOT NULL DEFAULT '1',
        "reward_id" uuid,
        "item_id" uuid,
        "food_id" uuid,
        CONSTRAINT "PK_reward_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reward_items_reward_id" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reward_items_item_id" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE NO ACTION,
        CONSTRAINT "FK_reward_items_food_id" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE NO ACTION
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "reward_items" ADD CONSTRAINT "UQ_reward_items_reward_id_food_id" UNIQUE ("reward_id", "food_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_items" ADD CONSTRAINT "UQ_reward_items_reward_id_item_id" UNIQUE ("reward_id", "item_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reward_items" DROP CONSTRAINT "UQ_reward_items_reward_id_item_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_items" DROP CONSTRAINT "UQ_reward_items_reward_id_food_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_items" DROP CONSTRAINT "FK_reward_items_food_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_items" DROP CONSTRAINT "FK_reward_items_item_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reward_items" DROP CONSTRAINT "FK_reward_items_reward_id"`,
    );

    await queryRunner.query(`DROP TABLE "reward_items"`);
    await queryRunner.query(`DROP TABLE "rewards"`);
  }
}
