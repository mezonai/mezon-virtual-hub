import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlantTable1761274377464 implements MigrationInterface {
  name = 'CreatePlantTable1761274377464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "grow_time" integer NOT NULL DEFAULT '0', "harvest_point" integer NOT NULL DEFAULT '0', "buy_price" integer NOT NULL DEFAULT '0', "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_plant_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "plants"`);
  }
}
