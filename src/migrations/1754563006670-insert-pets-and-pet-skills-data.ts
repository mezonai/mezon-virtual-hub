import { SkillCode, SkillType, PetType, AnimalRarity } from '@enum';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertPetsAndPetSkillsData1754563006670
  implements MigrationInterface
{
  name = 'InsertPetsAndPetSkillsData1754563006670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO pet_skills (
        skill_code,
        name,
        skill_type,
        element_type,
        damage,
        accuracy,
        power_points,
        description
      ) VALUES (
        '${SkillCode.WHIP_WIRE}',
        'Vine Whip - Dây roi',
        '${SkillType.DECREASE_ATTACK}',
        '${PetType.GRASS}',
        0,
        100,
        2,
        'Pet Tấn công đối thủ làm giảm chỉ số tấn công đối thủ đi 50%'
      );

      INSERT INTO pets (
        species,
        rarity,
        type,
        base_hp,
        base_attack,
        base_defense,
        base_speed,
        catch_chance
      ) VALUES
        ('DragonNormal', '${AnimalRarity.LEGENDARY}', '${PetType.DRAGON}', 95, 110, 105, 100, 120),
        ('DragonFire', '${AnimalRarity.LEGENDARY}', '${PetType.FIRE}', 90, 120, 115, 142, 120);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM pets
      WHERE species IN ('DragonNormal', 'DragonFire');

      DELETE FROM pet_skills
      WHERE skill_code = '${SkillCode.WHIP_WIRE}';
    `);
  }
}
