import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateItemTypeNotUnique1742350665342
  implements MigrationInterface
{
  name = 'UpdateItemTypeNotUnique1742350665342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const constraintExists = await queryRunner.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'item'::regclass
        AND contype = 'u'
        AND conname = 'UQ_a6c7fa282dcacbfe6247b28f135';
    `);

    if (constraintExists.length) {
      await queryRunner.query(`
        ALTER TABLE "item" DROP CONSTRAINT "UQ_a6c7fa282dcacbfe6247b28f135";
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item" ADD CONSTRAINT "UQ_a6c7fa282dcacbfe6247b28f135" UNIQUE ("type");
    `);
  }
}
