import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsPurchasableIntoItem1758524807533
  implements MigrationInterface
{
  name = 'AddIsPurchasableIntoItem1758524807533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "item" ADD "is_purchasable" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "is_purchasable"`);
  }
}
