import { PetsEntity } from '@modules/pets/entity/pets.entity';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPetsAndMigrateFromAnimal1752048907053
  implements MigrationInterface
{
  name = 'SeedPetsAndMigrateFromAnimal1752048907053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/pets.json');

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const pets: PetsEntity[] = JSON.parse(fileData);

    await queryRunner.query(`
      INSERT INTO pets (
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
        'normal',
        a.rarity::text::pets_rarity_enum
      FROM (
        SELECT DISTINCT ON (species, rarity)
          species,
          catch_chance,
          rarity
        FROM animal
        ORDER BY species, rarity
      ) a
      WHERE NOT EXISTS (
        SELECT 1
        FROM pets ps
        WHERE ps.species = a.species AND ps.rarity::text = a.rarity::text
      )
    `);

    for (const pet of pets) {
      const {
        species,
        rarity,
        base_hp,
        base_attack,
        base_defense,
        base_speed,
        type,
      } = pet;

      const result = await queryRunner.query(
        `UPDATE pets
        SET
          base_hp = $1,
          base_attack = $2,
          base_defense = $3,
          base_speed = $4,
          type = $5
        WHERE
          species = $6 AND rarity = $7
        RETURNING id
        `,
        [base_hp, base_attack, base_defense, base_speed, type, species, rarity],
      );

      if (result.length === 0) {
        await queryRunner.query(
          `INSERT INTO pets (
            id,
            species,
            rarity,
            base_hp,
            base_attack,
            base_defense,
            base_speed,
            type
          )
          VALUES (
            uuid_generate_v4(),
            $1, $2, $3, $4, $5, $6, $7
          )
        `,
          [
            species,
            rarity,
            base_hp,
            base_attack,
            base_defense,
            base_speed,
            type,
          ],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const filePath = path.resolve(__dirname, '../seeds/pets.json');

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const pets: PetsEntity[] = JSON.parse(fileData);

    for (const pet of pets) {
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('pets')
        .where('species = :species AND rarity = :rarity', {
          species: pet.species,
          rarity: pet.rarity,
        })
        .execute();
    }
  }
}
