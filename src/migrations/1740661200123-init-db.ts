import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDb1740661200123 implements MigrationInterface {
  name = 'InitDb1740661200123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY,
        "external_id" VARCHAR UNIQUE NULL,
        "auth_provider" VARCHAR NULL,
        "username" VARCHAR UNIQUE NOT NULL,
        "email" VARCHAR UNIQUE NOT NULL,
        "avatar_url" VARCHAR NULL,
        "position_x" INT NULL,
        "position_y" INT NULL,
        "default_map_id" INT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "map" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "width" INT NOT NULL,
        "height" INT NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "item" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "description" TEXT NULL,
        "width" INT NOT NULL,
        "height" INT NOT NULL,
        "is_equippable" BOOLEAN DEFAULT false,
        "is_static" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "inventory" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT NOT NULL,
        "item_id" INT NOT NULL,
        "equipped" BOOLEAN DEFAULT false,
        CONSTRAINT "FK_inventory_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inventory_item" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory"`);
    await queryRunner.query(`DROP TABLE "item"`);
    await queryRunner.query(`DROP TABLE "map"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
