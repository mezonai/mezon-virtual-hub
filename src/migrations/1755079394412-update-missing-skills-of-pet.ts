import { AnimalRarity, PetType, SkillCode } from "@enum";
import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMissingSkillsOfPet1755079394412 implements MigrationInterface {
    name = 'UpdateMissingSkillsOfPet1755079394412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const species = 'DragonNormal';
        const pets = await queryRunner.query(
            `SELECT id FROM pets WHERE species = $1 AND rarity = $2 AND type = $3 LIMIT 1`,
            [species, AnimalRarity.LEGENDARY, PetType.DRAGON]
        );

        const skillCode = SkillCode.DRAGON_CLAW;
        const skillIndex = 1
        const skillExists = await queryRunner.query(
            `SELECT skill_code FROM pet_skills WHERE skill_code = $1`,
            [skillCode],
        );

        if (skillExists.length === 0) {
            console.warn(`Skill not found: ${skillCode}`);
            return;
        }

        for (const pet of pets) {
            await queryRunner.query(`
                INSERT INTO pet_skill_usages (pet_id, skill_code, skill_index)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING
                `,
                [pet.id, skillCode, skillIndex],
            );

            await queryRunner.query(`
                UPDATE pet_players
                SET skill_code_1 = $2
                WHERE pet_players.pet_id = $1
                `,
                [pet.id, skillCode]
            );
        }
    }


    public async down(queryRunner: QueryRunner): Promise<void> { }

}
