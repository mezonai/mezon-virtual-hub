import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePetPlayersSkills1754636937623 implements MigrationInterface {
  name = 'UpdatePetPlayersSkills1754636937623';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
