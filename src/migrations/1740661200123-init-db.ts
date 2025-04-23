import { MapKey } from "@enum";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class InitDb1740661200123 implements MigrationInterface {
  name = 'InitDb1740661200123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE "map" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR NOT NULL,
        "is_locked" BOOLEAN DEFAULT false,
        "default_position_x" INT DEFAULT 0 NULL,
        "default_position_y" INT DEFAULT 0 NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "external_id" VARCHAR UNIQUE NULL,
        "auth_provider" VARCHAR NULL,
        "username" VARCHAR UNIQUE NOT NULL,
        "email" VARCHAR UNIQUE NULL,
        "avatar_url" VARCHAR NULL,
        "position_x" INT DEFAULT 0 NULL,
        "position_y" INT DEFAULT 0 NULL,
        "map_id" UUID NULL,
        "mezon_id" VARCHAR UNIQUE NULL,
        "display_name" VARCHAR NULL,
        "gender" VARCHAR NULL,
        "gold" INT DEFAULT 0 NOT NULL,
        "skin_set" TEXT[] NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP NULL,
        CONSTRAINT "FK_user_map" FOREIGN KEY ("map_id") REFERENCES "map"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "item" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR NOT NULL,
        "gender" VARCHAR NOT NULL,
        "gold" INT DEFAULT 0 NOT NULL,
        "type" INT NOT NULL,
        "is_equippable" BOOLEAN DEFAULT false,
        "is_static" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "deleted_at" TIMESTAMP NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "inventory" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL,
        "item_id" UUID NOT NULL,
        "equipped" BOOLEAN DEFAULT false,
        CONSTRAINT "FK_inventory_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_inventory_item" FOREIGN KEY ("item_id") REFERENCES "item" ("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.addColumn(
      'map',
      new TableColumn({
        name: 'map_key',
        type: 'enum',
        enum: Object.values(MapKey),
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inventory"`);
    await queryRunner.query(`DROP TABLE "item"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "map"`);
  }
}
