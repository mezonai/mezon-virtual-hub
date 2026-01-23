import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlotWheelEntity1768239253411 implements MigrationInterface {
    name = 'AddSlotWheelEntity1768239253411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "slot_wheel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying(50) NOT NULL,
                "type_item" character varying(50) NOT NULL,
                "quantity" integer NOT NULL DEFAULT 1,
                "weight_point" integer NOT NULL DEFAULT 1,
                "item_id" uuid,
                "food_id" uuid,
                "pet_id" uuid,
                "plant_id" uuid,
                CONSTRAINT "PK_slot_wheel_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "slot_wheel" ADD CONSTRAINT "FK_slot_wheel_item_id" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" ADD CONSTRAINT "FK_slot_wheel_food_id" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" ADD CONSTRAINT "FK_slot_wheel_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" ADD CONSTRAINT "FK_slot_wheel_plant_id" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "slot_wheel" DROP CONSTRAINT "FK_slot_wheel_plant_id"`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" DROP CONSTRAINT "FK_slot_wheel_pet_id"`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" DROP CONSTRAINT "FK_slot_wheel_food_id"`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" DROP CONSTRAINT "FK_slot_wheel_item_id"`);
        await queryRunner.query(`DROP TABLE "slot_wheel"`);
    }

}
