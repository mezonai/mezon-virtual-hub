import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePetTypeOfPetSkill1753771994803
  implements MigrationInterface
{
  name = 'UpdatePetTypeOfPetSkill1753771994803';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pet_skills" ADD "element_type" varchar(50) DEFAULT 'normal'
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skills" ADD "skill_type" varchar(50) DEFAULT 'attack'
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skills" ADD "effect_count" integer DEFAULT 0
    `);

    await queryRunner.query(`
      UPDATE "pet_skills"
      SET "element_type" = "type"
    `);
    await queryRunner.query(`
      UPDATE "pet_skills"
      SET "effect_count" = "attack"
    `);

    await queryRunner.query(`ALTER TABLE "pet_skills" DROP COLUMN "type"`);
    await queryRunner.query(`ALTER TABLE "pet_skills" DROP COLUMN "attack"`);

    await queryRunner.query(`
      ALTER TABLE "pet_skills"
      ALTER COLUMN "element_type" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skills"
      ALTER COLUMN "skill_type" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skills"
      ALTER COLUMN "effect_count" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pet_skills" ADD "type" varchar(50) DEFAULT 'NORMAL'
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skills" ADD "attack" integer DEFAULT 0
    `);

    await queryRunner.query(`
      UPDATE "pet_skills" SET "type" = "element_type"
    `);
    await queryRunner.query(`
      UPDATE "pet_skills" SET "attack" = "effect_count"
    `);

    await queryRunner.query(`ALTER TABLE "pet_skills" DROP COLUMN "element_type"`);
    await queryRunner.query(
      `ALTER TABLE "pet_skills" DROP COLUMN "skill_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_skills" DROP COLUMN "effect_count"`,
    );
  }
}
