import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateAnimalToPetSpecies1752048907053
  implements MigrationInterface
{
  name = 'MigrateAnimalToPetSpecies1752048907053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pet_species (
        id, species, catch_chance, base_hp, base_attack, base_defense, base_speed, type, rarity
      )
      SELECT
        uuid_generate_v4(),
        a.species,
        a.catch_chance,
        0,
        0,
        0,
        0,
        'Normal',
        a.rarity::text::pet_species_rarity_enum
      FROM (
        SELECT DISTINCT ON (species)
          species,
          catch_chance,
          rarity
        FROM animal
        ORDER BY species
      ) a
      WHERE NOT EXISTS (
        SELECT 1 FROM pet_species ps WHERE ps.species = a.species
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM pet_species
      WHERE species IN (
        SELECT DISTINCT species FROM animal
      )
    `);
  }
}
