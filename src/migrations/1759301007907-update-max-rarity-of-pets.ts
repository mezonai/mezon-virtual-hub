import { AnimalRarity, PetType } from '@enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMaxRarityOfPets1759301007907 implements MigrationInterface {
  name = 'UpdateMaxRarityOfPets1759301007907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const data: { species: string; type: PetType; maxRarity: AnimalRarity }[] =
      [
        { species: 'Bird', type: PetType.NORMAL, maxRarity: AnimalRarity.RARE },
        { species: 'Cat', type: PetType.NORMAL, maxRarity: AnimalRarity.RARE },
        { species: 'Dog', type: PetType.NORMAL, maxRarity: AnimalRarity.RARE },
        {
          species: 'Rabit',
          type: PetType.NORMAL,
          maxRarity: AnimalRarity.RARE,
        },
        { species: 'Sika', type: PetType.GRASS, maxRarity: AnimalRarity.EPIC },
        {
          species: 'Pokemon',
          type: PetType.ELECTRIC,
          maxRarity: AnimalRarity.LEGENDARY,
        },
        {
          species: 'Dragon',
          type: PetType.FIRE,
          maxRarity: AnimalRarity.LEGENDARY,
        },
        {
          species: 'PhoenixIce',
          type: PetType.ICE,
          maxRarity: AnimalRarity.LEGENDARY,
        },
        {
          species: 'DragonIce',
          type: PetType.ICE,
          maxRarity: AnimalRarity.LEGENDARY,
        },
        { species: 'Snowria', type: PetType.ICE, maxRarity: AnimalRarity.EPIC },
        {
          species: 'Leafeon',
          type: PetType.GRASS,
          maxRarity: AnimalRarity.EPIC,
        },
        {
          species: 'Lizard',
          type: PetType.GRASS,
          maxRarity: AnimalRarity.EPIC,
        },
        {
          species: 'Duskar',
          type: PetType.WATER,
          maxRarity: AnimalRarity.LEGENDARY,
        },
        {
          species: 'Bubblespark',
          type: PetType.ELECTRIC,
          maxRarity: AnimalRarity.EPIC,
        },
        {
          species: 'PhoenixFire',
          type: PetType.FIRE,
          maxRarity: AnimalRarity.LEGENDARY,
        },
        {
          species: 'DragonNormal',
          type: PetType.DRAGON,
          maxRarity: AnimalRarity.LEGENDARY,
        },
        {
          species: 'DragonFire',
          type: PetType.FIRE,
          maxRarity: AnimalRarity.LEGENDARY,
        },
      ];

    for (const entry of data) {
      await queryRunner.query(
        `
        UPDATE pets
        SET max_rarity = $1
        WHERE species = $2
          AND type = $3
        `,
        [entry.maxRarity, entry.species, entry.type],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE pets
      SET max_rarity = '${AnimalRarity.LEGENDARY}'
    `);
  }
}
