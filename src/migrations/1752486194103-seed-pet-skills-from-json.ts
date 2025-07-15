import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';

export class SeedPetSkillsFromJSON1752486194103 implements MigrationInterface {
  name = 'SeedPetSkillsFromJSON1752486194103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/pet-skills.json');

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const skills: PetSkillsEntity[] = JSON.parse(fileData);

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('pet_skills')
      .values(skills)
      .execute();
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
