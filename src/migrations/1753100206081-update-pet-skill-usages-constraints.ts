import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePetSkillUsagesConstraints1753100206081
  implements MigrationInterface
{
  name = 'UpdatePetSkillUsagesConstraints1753100206081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "FK_77476349e7de1889a37f2da4457"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "FK_62f7f13d68cf6d8dce29307f9ae"`,
    );

    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "PK_dffdab28bda956068a53920927d"`,
    );

    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" ADD "id" SERIAL NOT NULL`,
    );

    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages"
      ADD COLUMN "skill_index" integer;
    `);

    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" ADD CONSTRAINT "PK_pet_skill_usages_id" PRIMARY KEY ("id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_pet_skill_usages_pet_id" ON "pet_skill_usages" ("pet_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pet_skill_usages_skill_code" ON "pet_skill_usages" ("skill_code")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_pet_skill_usages_pet_skill" ON "pet_skill_usages" ("pet_id", "skill_code")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_pet_skill_usages_pet_index" ON "pet_skill_usages" ("pet_id", "skill_index")`,
    );

    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages"
      ADD CONSTRAINT "FK_pet_skill_usages_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages"
      ADD CONSTRAINT "FK_pet_skill_usages_skill_code" FOREIGN KEY ("skill_code") REFERENCES "pet_skills"("skill_code")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "FK_pet_skill_usages_skill_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "FK_pet_skill_usages_pet_id"`,
    );

    await queryRunner.query(`DROP INDEX "UQ_pet_skill_usages_pet_skill"`);
    await queryRunner.query(`DROP INDEX "UQ_pet_skill_usages_pet_index"`);

    await queryRunner.query(`DROP INDEX "IDX_pet_skill_usages_pet_id"`);
    await queryRunner.query(`DROP INDEX "IDX_pet_skill_usages_skill_code"`);

    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" DROP CONSTRAINT "PK_pet_skill_usages_id"`,
    );
    await queryRunner.query(`ALTER TABLE "pet_skill_usages" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" DROP COLUMN "skill_index"`,
    );

    await queryRunner.query(
      `ALTER TABLE "pet_skill_usages" ADD CONSTRAINT "PK_dffdab28bda956068a53920927d" PRIMARY KEY ("pet_id", "skill_code")`,
    );

    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages"
      ADD CONSTRAINT "FK_77476349e7de1889a37f2da4457" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "pet_skill_usages"
      ADD CONSTRAINT "FK_62f7f13d68cf6d8dce29307f9ae" FOREIGN KEY ("skill_code") REFERENCES "pet_skills"("skill_code") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }
}
