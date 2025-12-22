import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableGameConfigs1766381392436 implements MigrationInterface {
    name = 'CreateTableGameConfigs1766381392436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "game_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "key" character varying NOT NULL, "value" jsonb NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_944f485adb861a0baee12def6f4" UNIQUE ("key"), CONSTRAINT "PK_game_configs_id" PRIMARY KEY ("id"))`);
        }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "game_configs"`);
        }

}
