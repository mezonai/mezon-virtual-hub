import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePetPlayerTable1752052278416 implements MigrationInterface {
  name = 'CreatePetPlayerTable1752052278416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "pet_players" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying(50),
        "level" integer NOT NULL DEFAULT '1',
        "exp" integer NOT NULL DEFAULT '0',
        "stars" integer NOT NULL DEFAULT '1',
        "hp" integer NOT NULL DEFAULT '0',
        "attack" integer NOT NULL DEFAULT '0',
        "defense" integer NOT NULL DEFAULT '0',
        "speed" integer NOT NULL DEFAULT '0',
        "is_brought" boolean NOT NULL DEFAULT false,
        "is_caught" boolean NOT NULL DEFAULT false,
        "is_selected_battle" boolean NOT NULL DEFAULT false,
        "individual_value" integer NOT NULL DEFAULT '0',
        "room_code" character varying(255),
        "unlocked_skill_codes" character varying array,
        "user_id" uuid,
        "pet_id" uuid,
        CONSTRAINT "PK_8bf93899bdc7639a07005bd288f" PRIMARY KEY ("id")
      )`
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_9c9e6ffd0e86d238d0009940b32" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_8edef08e9647a7c35a0db608d44" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_8edef08e9647a7c35a0db608d44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_9c9e6ffd0e86d238d0009940b32"`,
    );

    await queryRunner.query(`DROP TABLE "pet_players"`);
  }
}
