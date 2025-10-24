import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFarmTable1761270434017 implements MigrationInterface {
  name = 'CreateFarmTable1761270434017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "farms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clan_id" uuid NOT NULL,
        "name" character varying,
        "quantity_slot" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_farms_id" PRIMARY KEY ("id")
      );
    `);

    const hasClanTable = await queryRunner.hasTable('clans');
    if (hasClanTable) {
      const hasFarmIdColumn = await queryRunner.hasColumn('clans', 'farm_id');
      if (!hasFarmIdColumn) {
        await queryRunner.query(`
          ALTER TABLE "clans"
          ADD COLUMN "farm_id" uuid;
        `);
      }

      await queryRunner.query(`
        ALTER TABLE "clans"
        ADD CONSTRAINT "FK_farm_id_clan"
        FOREIGN KEY ("farm_id") REFERENCES "farms"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
      `);
    }

    await queryRunner.query(`
      ALTER TABLE "farms"
      ADD CONSTRAINT "FK_clan_id_farm"
      FOREIGN KEY ("clan_id") REFERENCES "clans"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clans" DROP CONSTRAINT IF EXISTS "FK_farm_id_clan";`,
    );
    await queryRunner.query(
      `ALTER TABLE "farms" DROP CONSTRAINT IF EXISTS "FK_clan_id_farm";`,
    );

    const hasClanTable = await queryRunner.hasTable('clans');
    if (hasClanTable) {
      const hasFarmIdColumn = await queryRunner.hasColumn('clans', 'farm_id');
      if (hasFarmIdColumn) {
        await queryRunner.query(`ALTER TABLE "clans" DROP COLUMN "farm_id";`);
      }
    }

    await queryRunner.query(`DROP TABLE IF EXISTS "farms";`);
  }
}
