import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';

export class SeedPetSkillsFromJSON1752486194103 implements MigrationInterface {
  name = 'SeedPetSkillsFromJSON1752486194103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/pet-skills.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');

    const skills: {
      skill_code: string;
      name: string;
      type: string;
      attack: number;
      accuracy: number;
      power_points: number;
      description: string;
    }[] = JSON.parse(fileData);

    for (const s of skills) {
      await queryRunner.query(
        `
        INSERT INTO pet_skills
          (skill_code, name, type, attack, accuracy, power_points, description)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          s.skill_code,
          s.name,
          s.type,
          s.attack,
          s.accuracy,
          s.power_points,
          s.description,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/pet-skills.json');

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const skills: PetSkillsEntity[] = JSON.parse(fileData);

    const skillCodes = skills.map((s) => s.skill_code);

    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('pet_skills')
      .where('skill_code IN (:...skillCodes)', { skillCodes })
      .execute();
  }
}
