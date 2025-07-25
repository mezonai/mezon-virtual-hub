import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePetPlayerSkills1753411078908 implements MigrationInterface {
  name = 'UpdatePetPlayerSkills1753411078908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_724f7957be3200257110a84c9da" FOREIGN KEY ("skill_code_1") REFERENCES "pet_skills"("skill_code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_ea9a72bab4a5025d49775a8df78" FOREIGN KEY ("skill_code_2") REFERENCES "pet_skills"("skill_code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_316926e120ac07acd7b57de5393" FOREIGN KEY ("skill_code_3") REFERENCES "pet_skills"("skill_code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_690e9e334cb56c0d76bbfaa1ee4" FOREIGN KEY ("skill_code_4") REFERENCES "pet_skills"("skill_code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`
      WITH ranked_skills AS (
        SELECT
          psu.pet_id,
          psu.skill_code,
          psu.skill_index,
          ROW_NUMBER() OVER (PARTITION BY psu.pet_id ORDER BY psu.skill_index ASC) as rn
        FROM pet_skill_usages psu
      ),
      first_skills AS (
        SELECT
          rp.id AS pet_player_id,
          rs1.skill_code AS skill_code_1,
          rs2.skill_code AS skill_code_2
        FROM pet_players rp
        LEFT JOIN ranked_skills rs1 ON rs1.pet_id = rp.pet_id AND rs1.rn = 1
        LEFT JOIN ranked_skills rs2 ON rs2.pet_id = rp.pet_id AND rs2.rn = 2
      )
      UPDATE pet_players
      SET
        skill_code_1 = fs.skill_code_1,
        skill_code_2 = fs.skill_code_2
      FROM first_skills fs
      WHERE pet_players.id = fs.pet_player_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE pet_players
      SET
        skill_code_1 = NULL,
        skill_code_2 = NULL;
    `);

    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_690e9e334cb56c0d76bbfaa1ee4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_316926e120ac07acd7b57de5393"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_ea9a72bab4a5025d49775a8df78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_724f7957be3200257110a84c9da"`,
    );
  }
}
