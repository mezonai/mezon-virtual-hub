import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNumberRarity1766481809586 implements MigrationInterface {
    name = 'AddNumberRarity1766481809586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "number_rarity" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_code" character varying(255) NOT NULL, "common_number" integer NOT NULL DEFAULT '6', "rare_number" integer NOT NULL DEFAULT '3', "epic_number" integer NOT NULL DEFAULT '1', "legendary_number" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_2a6ca7f3e62ed648a08627b0090" PRIMARY KEY ("id")), CONSTRAINT "UQ_number_rarity_room_code" UNIQUE ("room_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "number_rarity"`);
    }

}