import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateAnimalToPetPlayer1752052498886
  implements MigrationInterface
{
  name = 'MigrateAnimalToPetPlayer1752052498886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pet_players (
        id,
        name,
        hp,
        attack,
        defense,
        speed,
        is_brought,
        is_caught,
        individual_value,
        room_code,
        user_id,
        pet_id,
        created_at,
        updated_at
      )
      SELECT
        uuid_generate_v4(),               -- id
        a.name,                           -- name
        ps.base_hp,                       -- hp
        ps.base_attack,                   -- attack
        ps.base_defense,                  -- defense
        ps.base_speed,                    -- speed
        a.is_brought,                     -- is_brought
        a.is_caught,                      -- is_caught
        FLOOR(random() * 31 + 1)::int,    -- individual_value between 1 and 31
        a.room_code,                      -- room_code
        a.user_id,                        -- user_id
        ps.id,                            -- pet_id (join by species AND rarity)
        now(),                            -- created_at
        now()                             -- updated_at
      FROM animal a
      INNER JOIN pets ps
        ON ps.species = a.species
        AND ps.rarity::TEXT = a.rarity::TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM pet_players
    `);
  }
}
