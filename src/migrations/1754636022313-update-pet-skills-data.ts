import { SkillCode } from '@enum';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePetSkillsData1754636022313 implements MigrationInterface {
  name = 'UpdatePetSkillsData1754636022313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(
      __dirname,
      '../seeds/1754636022313-pet-skill-usages.json',
    );
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const petSkills: { species: string; skills: SkillCode[] }[] =
      JSON.parse(fileData);

    for (const item of petSkills) {
      const { species, skills } = item;

      const pets: { id: string }[] = await queryRunner.query(
        `SELECT id FROM pets WHERE LOWER(species) = LOWER($1)`,
        [species],
      );

      if (pets.length === 0) {
        console.warn(`No pets found for species: ${species}`);
        continue;
      }

      for (let i = 0; i < skills.length; i++) {
        const skillCode = skills[i];
        const skillIndex = i + 1;

        const skillExists = await queryRunner.query(
          `SELECT skill_code FROM pet_skills WHERE skill_code = $1`,
          [skillCode],
        );

        if (skillExists.length === 0) {
          console.warn(`Skill not found: ${skillCode}`);
          continue;
        }

        for (const pet of pets) {
          await queryRunner.query(
            `DELETE FROM pet_skill_usages
            WHERE pet_id = $1 AND skill_index = $2`,
            [pet.id, skillIndex],
          );

          await queryRunner.query(
            `INSERT INTO pet_skill_usages (pet_id, skill_code, skill_index)
            VALUES ($1, $2, $3)
            ON CONFLICT (pet_id, skill_code)
            DO UPDATE SET skill_index = EXCLUDED.skill_index`,
            [pet.id, skillCode, skillIndex],
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
