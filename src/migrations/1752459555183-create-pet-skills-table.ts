import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePetSkillsTable1752459555183 implements MigrationInterface {
  name = 'CreatePetSkillsTable1752459555183';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "pet_skills" (
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "skill_code" character varying(20) NOT NULL,
        "name" character varying(50) NOT NULL,
        "type" character varying(50) NOT NULL DEFAULT 'normal',
        "attack" integer NOT NULL DEFAULT '0',
        "accuracy" integer NOT NULL DEFAULT '100',
        "power_points" integer NOT NULL DEFAULT '10',
        "description" text,
        CONSTRAINT "PK_adee2735340efc67e1570b94035" PRIMARY KEY ("skill_code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "pet_skill_usages" (
        "pet_id" uuid NOT NULL,
        "skill_code" character varying(20) NOT NULL,
        CONSTRAINT "PK_dffdab28bda956068a53920927d" PRIMARY KEY ("pet_id", "skill_code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_77476349e7de1889a37f2da445" ON "pet_skill_usages" ("pet_id") 
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_62f7f13d68cf6d8dce29307f9a" ON "pet_skill_usages" ("skill_code") 
    `);

    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages" 
      ADD CONSTRAINT "FK_77476349e7de1889a37f2da4457" 
      FOREIGN KEY ("pet_id") 
      REFERENCES "pets"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages" 
      ADD CONSTRAINT "FK_62f7f13d68cf6d8dce29307f9ae" 
      FOREIGN KEY ("skill_code") 
      REFERENCES "pet_skills"("skill_code")
      ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "FK_62f7f13d68cf6d8dce29307f9ae"
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "FK_77476349e7de1889a37f2da4457"
    `);

    await queryRunner.query(`DROP TABLE "pet_skill_usages"`);
    await queryRunner.query(`DROP TABLE "pet_skills"`);
  }
}
