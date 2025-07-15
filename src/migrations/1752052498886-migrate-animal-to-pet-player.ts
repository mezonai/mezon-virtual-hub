import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateAnimalToPetPlayer1752052498886 implements MigrationInterface {
  name = 'MigrateAnimalToPetPlayer1752052498886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pet_player (
        id,
        name,
        level,
        exp,
        stars,
        hp,
        attack,
        defense,
        speed,
        is_brought,
        is_caught,
        individual_value,
        room_code,
        user_id,
        pet_species_id,
        created_at,
        updated_at
      )
      SELECT
        uuid_generate_v4(),               -- id
        a.name,                           -- name
        0,                                -- level
        0,                                -- exp
        0,                                -- stars
        0,                                -- hp
        0,                                -- attack
        0,                                -- defense
        0,                                -- speed
        a.is_brought,                     -- is_brought
        a.is_caught,                      -- is_caught
        FLOOR(random() * 31 + 1)::int,    -- individual_value between 1 and 31
        a.room_code,                      -- room_code
        a.user_id,                        -- user_id
        ps.id,                            -- pet_species_id (join by species name)
        now(),                            -- created_at
        now()                             -- updated_at
      FROM animal a
      INNER JOIN pet_species ps
        ON ps.species = a.species
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM pet
      WHERE id IN (
        SELECT pet.id
        FROM pet
        INNER JOIN pet_species ps ON pet.pet_species_id = ps.id
        INNER JOIN animal a ON a.species = ps.species
      )
    `);
  }
}
