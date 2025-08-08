import { SkillCode, SkillType, PetType, AnimalRarity } from '@enum';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertPetsAndPetSkillsData1754563006670
  implements MigrationInterface
{
  name = 'InsertPetsAndPetSkillsData1754563006670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const skill: Partial<PetSkillsEntity> = {
      skill_code: SkillCode.WHIP_WIRE,
      name: 'Vine Whip - Dây roi',
      skill_type: SkillType.DECREASE_ATTACK,
      element_type: PetType.GRASS,
      damage: 0,
      accuracy: 100,
      power_points: 2,
      description:
        'Pet Tấn công đối thủ làm giảm chỉ số tấn công đối thủ đi 50% ',
    };

    const newPets: Partial<PetsEntity>[] = [
      {
        species: 'DragonNormal',
        rarity: AnimalRarity.LEGENDARY,
        type: PetType.DRAGON,
        base_hp: 95,
        base_attack: 110,
        base_defense: 105,
        base_speed: 100,
        catch_chance: 120,
      },
      {
        species: 'DragonFire',
        rarity: AnimalRarity.LEGENDARY,
        type: PetType.FIRE,
        base_hp: 90,
        base_attack: 120,
        base_defense: 115,
        base_speed: 142,
        catch_chance: 120,
      },
    ];

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('pet_skills')
      .values(skill)
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('pets')
      .values(newPets)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM pets WHERE species IN ($1, $2)`, [
      'DragonNormal',
      'DragonFire',
    ]);

    await queryRunner.query(`DELETE FROM pet_skills WHERE skill_code = $1`, [
      SkillCode.WHIP_WIRE,
    ]);
  }
}
