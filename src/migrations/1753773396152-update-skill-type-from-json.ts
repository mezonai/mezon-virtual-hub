import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class UpdateSkillTypeFromJson1753773396152
  implements MigrationInterface
{
  name = 'UpdateSkillTypeFromJson1753773396152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/skill-type-of-pet-skills.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const skills: { skill_code: string; skill_type: string }[] =
      JSON.parse(fileData);

    for (const skill of skills) {
      await queryRunner.query(
        `UPDATE pet_skills SET skill_type = $1 WHERE skill_code = $2`,
        [skill.skill_type, skill.skill_code],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE pet_skills SET skill_type = 'attack'`);
  }
}
