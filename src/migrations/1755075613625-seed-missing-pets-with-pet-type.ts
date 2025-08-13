import { AnimalRarity, PetType } from "@enum";
import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedMissingPetsWithPetType1755075613625 implements MigrationInterface {
    name = 'SeedMissingPetsWithPetType1755075613625'


    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "pets"
            DROP CONSTRAINT "UQ_30d2c0e21103e01d3161ea3f92a"
        `);

        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_pets_species_rarity_type" ON "pets" ("species", "rarity", "type")`,
        );

        // [species, rarity, type, base_hp, base_attack, base_defense, base_speed, catch_chance]
        const pets: [string, AnimalRarity, PetType, number, number, number, number, number][] = [
            ['Bird', AnimalRarity.COMMON, PetType.NORMAL, 40, 35, 30, 85, 2],
            ['Bird', AnimalRarity.RARE, PetType.NORMAL, 55, 35, 35, 90, 4],
            ['Cat', AnimalRarity.COMMON, PetType.NORMAL, 40, 40, 35, 50, 2],
            ['Cat', AnimalRarity.RARE, PetType.NORMAL, 60, 40, 35, 70, 4],
            ['Dog', AnimalRarity.COMMON, PetType.NORMAL, 45, 55, 40, 65, 4],
            ['Dog', AnimalRarity.RARE, PetType.NORMAL, 65, 45, 35, 75, 6],
            ['Rabit', AnimalRarity.COMMON, PetType.NORMAL, 35, 50, 23, 40, 2],
            ['Rabit', AnimalRarity.RARE, PetType.NORMAL, 55, 40, 35, 70, 4],
            ['Sika', AnimalRarity.COMMON, PetType.GRASS, 40, 40, 40, 40, 4],
            ['Sika', AnimalRarity.RARE, PetType.GRASS, 65, 65, 65, 65, 6],
            ['Sika', AnimalRarity.EPIC, PetType.GRASS, 70, 70, 70, 70, 8],
            ['Pokemon', AnimalRarity.COMMON, PetType.ELECTRIC, 30, 40, 15, 60, 10],
            ['Pokemon', AnimalRarity.RARE, PetType.ELECTRIC, 50, 80, 50, 90, 15],
            ['Pokemon', AnimalRarity.EPIC, PetType.ELECTRIC, 70, 90, 55, 95, 20],
            ['Pokemon', AnimalRarity.LEGENDARY, PetType.ELECTRIC, 75, 95, 60, 100, 40],
            ['Dragon', AnimalRarity.COMMON, PetType.FIRE, 39, 52, 43, 65, 15],
            ['Dragon', AnimalRarity.RARE, PetType.FIRE, 58, 64, 58, 80, 15],
            ['Dragon', AnimalRarity.EPIC, PetType.FIRE, 78, 84, 78, 100, 20],
            ['Dragon', AnimalRarity.LEGENDARY, PetType.FIRE, 78, 100, 100, 110, 50],
            ['PhoenixIce', AnimalRarity.EPIC, PetType.ICE, 90, 85, 100, 90, 70],
            ['PhoenixIce', AnimalRarity.LEGENDARY, PetType.ICE, 106, 110, 90, 130, 80],
            ['DragonIce', AnimalRarity.LEGENDARY, PetType.ICE, 90, 120, 115, 142, 120],
            ['Snowria', AnimalRarity.COMMON, PetType.ICE, 60, 45, 60, 55, 50],
            ['Snowria', AnimalRarity.RARE, PetType.ICE, 80, 60, 75, 65, 60],
            ['Snowria', AnimalRarity.EPIC, PetType.ICE, 90, 75, 95, 75, 70],
            ['Leafeon', AnimalRarity.EPIC, PetType.GRASS, 45, 45, 40, 60, 50],
            ['Leafeon', AnimalRarity.COMMON, PetType.GRASS, 65, 55, 50, 75, 60],
            ['Leafeon', AnimalRarity.RARE, PetType.GRASS, 80, 70, 60, 95, 70],
            ['Lizard', AnimalRarity.RARE, PetType.GRASS, 60, 52, 48, 60, 60],
            ['Lizard', AnimalRarity.EPIC, PetType.GRASS, 78, 70, 65, 72, 70],
            ['Duskar', AnimalRarity.COMMON, PetType.WATER, 45, 40, 38, 50, 50],
            ['Duskar', AnimalRarity.RARE, PetType.WATER, 60, 52, 48, 60, 60],
            ['Duskar', AnimalRarity.EPIC, PetType.WATER, 78, 70, 65, 72, 70],
            ['Duskar', AnimalRarity.LEGENDARY, PetType.WATER, 95, 88, 80, 85, 80],
            ['Bubblespark', AnimalRarity.RARE, PetType.ELECTRIC, 60, 75, 40, 90, 20],
            ['Bubblespark', AnimalRarity.EPIC, PetType.ELECTRIC, 72, 85, 45, 97, 50],
            ['PhoenixFire', AnimalRarity.LEGENDARY, PetType.FIRE, 106, 110, 90, 130, 120],
            ['PhoenixFire', AnimalRarity.EPIC, PetType.FIRE, 90, 85, 100, 90, 80],
            ['DragonNormal', AnimalRarity.LEGENDARY, PetType.DRAGON, 95, 110, 105, 100, 100],
            ['DragonFire', AnimalRarity.LEGENDARY, PetType.FIRE, 90, 120, 115, 142, 120],
        ];

        for (const [species, rarity, type, base_hp, base_attack, base_defense, base_speed, catch_chance] of pets) {
            const exists = await queryRunner.query(
                `SELECT 1 FROM pets WHERE species = $1 AND rarity = $2 AND type = $3 LIMIT 1`,
                [species, rarity, type]
            );

            if (exists.length === 0) {
                await queryRunner.query(`
                    INSERT INTO pets (species, rarity, type, base_hp, base_attack, base_defense, base_speed, catch_chance)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `,
                    [species, rarity, type, base_hp, base_attack, base_defense, base_speed, catch_chance]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "UQ_pets_species_rarity_type"`);

        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_30d2c0e21103e01d3161ea3f92a" ON "pets" ("species", "rarity")`,
        );
    }

}
