import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPetClanCode1770360848676 implements MigrationInterface {
    name = 'AddPetClanCode1770360848676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_clan" ADD "pet_clan_code" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ADD CONSTRAINT "UQ_e454b1891bb68b3585bb0a44dba" UNIQUE ("pet_clan_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_clan" DROP COLUMN "pet_clan_code"`);
    }

}
