import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWheelEntity1768803760133 implements MigrationInterface {
    name = 'AddWheelEntity1768803760133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "wheel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying(50) NOT NULL,
                "base_fee" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_wheel_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "slot_wheel" ADD "wheel_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" ADD CONSTRAINT "FK_slot_wheel_wheel_id" FOREIGN KEY ("wheel_id") REFERENCES "wheel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" DROP COLUMN "type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "slot_wheel" ADD "type" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" DROP CONSTRAINT "FK_slot_wheel_wheel_id"`);
        await queryRunner.query(`ALTER TABLE "slot_wheel" DROP COLUMN "wheel_id"`);
        await queryRunner.query(`DROP TABLE "wheel"`);
    }

}
