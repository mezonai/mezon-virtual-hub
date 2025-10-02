import { RARITY_ORDER, RARITY_MULTIPLIER } from '@constant';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizePetPlayersStats1759299605324
  implements MigrationInterface
{
  name = 'NormalizePetPlayersStats1759299605324';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const pets: PetsEntity[] = await queryRunner.query(`
      SELECT id, species, type, rarity, base_hp, base_attack, base_defense, base_speed
      FROM pets
    `);

    // Group pets by species+type
    const grouped = new Map<string, typeof pets>();

    for (const pet of pets) {
      const key = `${pet.species}::${pet.type}`;
      const list = grouped.get(key) ?? [];
      list.push(pet);
      grouped.set(key, list);
    }

    // 3. For each group, pick lowest rarity pet
    for (const [key, group] of grouped.entries()) {
      const sorted = group.sort(
        (a, b) =>
          RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity),
      );
      const keeper = sorted[0]; // lowest rarity
      const toReplace = sorted.slice(1);

      const keeperMultiplier = RARITY_MULTIPLIER[keeper.rarity];
      // Update pet_players to point to keeper
      for (const pet of toReplace) {
        const currentMultiplier = RARITY_MULTIPLIER[pet.rarity];
        const ratio = currentMultiplier / keeperMultiplier;
        await queryRunner.query(
          `
          UPDATE pet_players
          SET pet_id = $1,
            hp = CAST($3 AS numeric) * CAST($7 AS numeric),
            attack = CAST($4 AS numeric) * CAST($7 AS numeric),
            defense = CAST($5 AS numeric) * CAST($7 AS numeric),
            speed = CAST($6 AS numeric) * CAST($7 AS numeric)
          WHERE pet_id = $2
          `,
          [
            keeper.id,
            pet.id,
            pet.base_hp,
            pet.base_attack,
            pet.base_defense,
            pet.base_speed,
            ratio,
          ],
        );

        // 🔥 Update reward_items with type 'pet' as well
        await queryRunner.query(
          `
            UPDATE reward_items
            SET pet_id = $1
            WHERE pet_id = $2
            AND type = 'pet'
            `,
          [keeper.id, pet.id],
        );
      }

      if (toReplace.length > 0) {
        const ids = toReplace.map((p) => `'${p.id}'`).join(',');
        await queryRunner.query(`
          DELETE FROM pets
          WHERE id IN (${ids})
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
