import { MigrationInterface, QueryRunner } from "typeorm";
import { SkillCode } from '@enum';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import * as fs from 'fs';
import * as path from 'path';

export class UpdatePetSkills1755830213155 implements MigrationInterface {
    name = 'UpdatePetSkills1755830213155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const filePath = path.resolve(__dirname, '../seeds/1755830213155-pet-skill-usages.json');
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const petSkills: { species: string; skills: SkillCode[] }[] =
            JSON.parse(fileData);

        await queryRunner.query(`DROP INDEX "UQ_pet_skill_usages_pet_skill"`);

        for (const item of petSkills) {
            const { species, skills } = item;

            const pets: PetsEntity[] = await queryRunner.query(
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
                        `INSERT INTO pet_skill_usages (pet_id, skill_code, skill_index)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (pet_id, skill_index) 
                    DO UPDATE SET skill_code = EXCLUDED.skill_code`,
                        [pet.id, skillCode, skillIndex],
                    );
                }
            }
        }
        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_pet_skill_usages_pet_skill" ON "pet_skill_usages" ("pet_id", "skill_code")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}
