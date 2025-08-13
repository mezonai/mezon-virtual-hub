import { PetType } from "@enum";
import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRedundantPets1755081048945 implements MigrationInterface {
    name = 'RemoveRedundantPets1755081048945';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const dragonIceSpecies = 'DragonIce';
        const phoenixIceSpecies = 'PhoenixIce';
        const types = [PetType.NORMAL, PetType.DRAGON];

        for (const type of types) {
            const pets = await queryRunner.query(`
                SELECT id FROM pets
                WHERE species = $1
                  AND type = $2
                `,
                [dragonIceSpecies, type]
            );

            if (pets.length > 0) {
                const petIds = pets.map((p: any) => p.id);

                await queryRunner.query(`
                    DELETE FROM pet_players
                    WHERE pet_id = ANY($1)
                    `,
                    [petIds]
                );

                await queryRunner.query(`
                    DELETE FROM pets
                    WHERE id = ANY($1)
                    `,
                    [petIds]
                );
            }
        }

        const phoenixPets = await queryRunner.query(`
            SELECT id FROM pets
            WHERE species = $1
              AND type = $2
            `,
            [phoenixIceSpecies, PetType.FIRE]
        );

        if (phoenixPets.length > 0) {
            const phoenixPetIds = phoenixPets.map((p: any) => p.id);

            await queryRunner.query(`
                DELETE FROM pet_players
                WHERE pet_id = ANY($1)
                `,
                [phoenixPetIds]
            );

            await queryRunner.query(`
                DELETE FROM pets
                WHERE id = ANY($1)
                `,
                [phoenixPetIds]
            );
        }
    }

    public async down(): Promise<void> {
        console.warn(
            'Down migration not implemented because deleted data cannot be restored.'
        );
    }
}
