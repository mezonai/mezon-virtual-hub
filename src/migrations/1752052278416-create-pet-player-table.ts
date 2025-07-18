import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePetPlayerTable1752052278416 implements MigrationInterface {
  name = 'CreatePetPlayerTable1752052278416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pet_players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(50), "level" integer NOT NULL DEFAULT '0', "exp" integer NOT NULL DEFAULT '0', "stars" integer NOT NULL DEFAULT '0', "hp" integer NOT NULL DEFAULT '0', "attack" integer NOT NULL DEFAULT '0', "defense" integer NOT NULL DEFAULT '0', "speed" integer NOT NULL DEFAULT '0', "is_brought" boolean NOT NULL DEFAULT false, "is_caught" boolean NOT NULL DEFAULT false, "individual_value" integer NOT NULL DEFAULT '0', "room_code" character varying(255), "unlocked_skill_codes" character varying array, "user_id" uuid, "pet_species_id" uuid, CONSTRAINT "PK_cb5ba408e702acf9ec5e373c011" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_324ce7a9d6b25b15ce3dad7ba14" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" ADD CONSTRAINT "FK_fb18706c931ba9afd26de0c1d4f" FOREIGN KEY ("pet_species_id") REFERENCES "pet_species"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_fb18706c931ba9afd26de0c1d4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pet_players" DROP CONSTRAINT "FK_324ce7a9d6b25b15ce3dad7ba14"`,
    );

    await queryRunner.query(`DROP TABLE "pet_players"`);
  }
}
