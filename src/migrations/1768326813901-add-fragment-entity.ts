import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFragmentEntity1768326813901 implements MigrationInterface {
    name = 'AddFragmentEntity1768326813901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "fragment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "pet_id" uuid NOT NULL, 
                CONSTRAINT "PK_fragment_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "fragment_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "fragment_id" uuid NOT NULL, 
                "item_id" uuid NOT NULL, 
                "part" integer NOT NULL, 
                "required_quantity" integer NOT NULL DEFAULT '1', 
                CONSTRAINT "PK_5827b102073dcc1e94cd3221ad1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`ALTER TABLE "fragment" ADD CONSTRAINT "FK_fragment_pet_id" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fragment_item" ADD CONSTRAINT "FK_424aa140163a368d781d1caf6cf" FOREIGN KEY ("fragment_id") REFERENCES "fragment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fragment_item" ADD CONSTRAINT "FK_bd809c402b87433724c6e02f94a" FOREIGN KEY ("item_id") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fragment_item" ADD CONSTRAINT "UQ_fragment_part" UNIQUE ("fragment_id", "part")`);
        await queryRunner.query(`ALTER TABLE "fragment_item" ADD CONSTRAINT "UQ_fragment_item" UNIQUE ("fragment_id", "item_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_fragment_item_fragment" ON "fragment_item" ("fragment_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_fragment_item_item" ON "fragment_item" ("item_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_fragment_item_item"`);
        await queryRunner.query(`DROP INDEX "IDX_fragment_item_fragment"`);
        await queryRunner.query(`ALTER TABLE "fragment_item" DROP CONSTRAINT "UQ_fragment_item"`);
        await queryRunner.query(`ALTER TABLE "fragment_item" DROP CONSTRAINT "UQ_fragment_part"`);
        await queryRunner.query(`ALTER TABLE "fragment_item" DROP CONSTRAINT "FK_bd809c402b87433724c6e02f94a"`);
        await queryRunner.query(`ALTER TABLE "fragment_item" DROP CONSTRAINT "FK_424aa140163a368d781d1caf6cf"`);
        await queryRunner.query(`ALTER TABLE "fragment" DROP CONSTRAINT "FK_fragment_pet_id"`);
        await queryRunner.query(`DROP TABLE "fragment_item"`);
        await queryRunner.query(`DROP TABLE "fragment"`);
    }

}
