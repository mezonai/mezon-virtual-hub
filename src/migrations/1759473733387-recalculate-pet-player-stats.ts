import { RARITY_BASE, STAR_MULTIPLIER } from '@constant';
import { AnimalRarity } from '@enum';
import { getExpForNextLevel } from '@libs/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecalculatePetPlayerStats1759473733387
  implements MigrationInterface
{
  name = 'RecalculatePetPlayerStats1759473733387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Load all pet players joined with their base pets
    const petPlayers: Array<{
      id: string;
      level: number;
      exp: number;
      stars: number;
      individual_value: number | null;
      current_rarity: AnimalRarity;
      base_hp: number;
      base_attack: number;
      base_defense: number;
      base_speed: number;
      base_rarity: AnimalRarity;
    }> = await queryRunner.query(`
      SELECT pp.id,
             pp.level,
             pp.exp,
             pp.stars,
             pp.individual_value,
             pp.current_rarity,
             p.base_hp,
             p.base_attack,
             p.base_defense,
             p.base_speed,
             p.rarity as base_rarity
      FROM pet_players pp
      JOIN pets p ON pp.pet_id = p.id
    `);

    for (const pp of petPlayers) {
      const iv = pp.individual_value ?? 0;
      let exp = pp.exp ?? 0;
      let level = pp.level ?? 1;

      // 2️⃣ Recalculate level based on exp
      while (exp >= getExpForNextLevel(level)) {
        exp -= getExpForNextLevel(level);
        level++;
      }

      // 3️⃣ Base stat formulas (Pokémon style)
      const hp =
        pp.base_hp +
        Math.floor(((pp.base_hp * 2 + iv) * level) / 100 + level + 10);
      const attack =
        pp.base_attack +
        Math.floor(((pp.base_attack * 2 + iv) * level) / 100 + 5);
      const defense =
        pp.base_defense +
        Math.floor(((pp.base_defense * 2 + iv) * level) / 100 + 5);
      const speed =
        pp.base_speed +
        Math.floor(((pp.base_speed * 2 + iv) * level) / 100 + 5);

      const starMultiplier = STAR_MULTIPLIER[pp.stars] ?? 1.0;
      const baseMultiplier = RARITY_BASE[pp.base_rarity] * starMultiplier;
      const currentMultiplier =
        RARITY_BASE[pp.current_rarity] * starMultiplier;

      const rarityMultiplier = currentMultiplier / baseMultiplier;

      const multiplier = rarityMultiplier * starMultiplier;

      const finalHp = Math.floor(hp * multiplier);
      const finalAttack = Math.floor(attack * multiplier);
      const finalDefense = Math.floor(defense * multiplier);
      const finalSpeed = Math.floor(speed * multiplier);

      // 5️⃣ Update pet player stats in DB
      await queryRunner.query(
        `
        UPDATE pet_players
        SET hp = $1,
            attack = $2,
            defense = $3,
            speed = $4,
            exp = $5,
            level = $6
        WHERE id = $7
        `,
        [finalHp, finalAttack, finalDefense, finalSpeed, exp, level, pp.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
