import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlantIdRewardItem1767086084606 implements MigrationInterface {
    name = 'AddPlantIdRewardItem1767086084606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reward_items" ADD "plant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "reward_items" ADD CONSTRAINT "FK_reward_items_plant_id" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reward_items" DROP CONSTRAINT "FK_reward_items_plant_id"`);
        await queryRunner.query(`ALTER TABLE "reward_items" DROP COLUMN "plant_id"`);
    }

}
