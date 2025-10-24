import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlantStageTable1761274396060 implements MigrationInterface {
  name = 'CreatePlantStageTable1761274396060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plant_stages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plant_id" uuid NOT NULL, "stage_name" character varying, "ratio_start" numeric NOT NULL DEFAULT '0', "ratio_end" numeric, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_plant_stage_id" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "plant_stages"`);
  }
}
