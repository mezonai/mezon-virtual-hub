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
      CREATE TABLE "pet_species_skills" (
        "pet_species_id" uuid NOT NULL,
        "skill_code" character varying(20) NOT NULL,
        CONSTRAINT "PK_1a7098682b6947aabf5dd3b7757" PRIMARY KEY ("pet_species_id", "skill_code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_111c07da663a89b7467d904b84" ON "pet_species_skills" ("pet_species_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_098198432996048946affff935" ON "pet_species_skills" ("skill_code")
    `);

    await queryRunner.query(`
      ALTER TABLE "pet_species_skills"
      ADD CONSTRAINT "FK_111c07da663a89b7467d904b84b"
      FOREIGN KEY ("pet_species_id")
      REFERENCES "pet_species"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_species_skills"
      ADD CONSTRAINT "FK_098198432996048946affff9356"
      FOREIGN KEY ("skill_code")
      REFERENCES "pet_skills"("skill_code")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pet_species_skills" DROP CONSTRAINT "FK_098198432996048946affff9356"
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_species_skills" DROP CONSTRAINT "FK_111c07da663a89b7467d904b84b"
    `);

    await queryRunner.query(`DROP TABLE "pet_species_skills"`);
    await queryRunner.query(`DROP TABLE "pet_skills"`);
  }
}
