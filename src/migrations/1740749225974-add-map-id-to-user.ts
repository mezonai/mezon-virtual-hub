import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMapIdToUser1740749225974 implements MigrationInterface {
  name = 'AddMapIdToUser1740749225974';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "default_map_id"`);
    
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "map_id" UUID NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_map" FOREIGN KEY ("map_id") REFERENCES "map"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_map"`);

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "map_id"`);

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "default_map_id" INT NULL
    `);
  }
}
