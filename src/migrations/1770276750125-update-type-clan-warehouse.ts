import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateClanWarehouseTypeToVarchar1770276750125 implements MigrationInterface {
    name = 'UpdateClanWarehouseTypeToVarchar1770276750125';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" TYPE character varying(50) USING "type"::text`);
        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" SET DEFAULT 'plant'`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."clan_warehouses_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."inventory_clan_type_enum"`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ADD "pet_clan_code" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ADD CONSTRAINT "UQ_e454b1891bb68b3585bb0a44dba" UNIQUE ("pet_clan_code")`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_rate_affect" TYPE integer USING "base_rate_affect"::integer`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_exp_per_level" SET DEFAULT 1000`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_exp_increment_per_level" TYPE double precision USING "base_exp_increment_per_level"::double precision`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_exp_increment_per_level" SET DEFAULT 1.5`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_rate_affect" TYPE double precision USING "base_rate_affect"::double precision`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_rate_affect" SET DEFAULT 10`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_exp_per_level" SET DEFAULT 100`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_exp_increment_per_level" TYPE integer USING "base_exp_increment_per_level"::integer`);
        await queryRunner.query(`ALTER TABLE "pet_clan" ALTER COLUMN "base_exp_increment_per_level" SET DEFAULT 50`);
        await queryRunner.query(`ALTER TABLE "pet_clan" DROP COLUMN "pet_clan_code"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_clan_type_enum" AS ENUM('plant', 'harvest_tool_1', 'harvest_tool_2', 'harvest_tool_3', 'harvest_tool_4', 'harvest_tool_5', 'growth_plant_tool_1', 'growth_plant_tool_2', 'growth_plant_tool_3', 'growth_plant_tool_4', 'growth_plant_tool_5', 'interrupt_harvest_tool_1', 'interrupt_harvest_tool_2', 'interrupt_harvest_tool_3', 'interrupt_harvest_tool_4', 'interrupt_harvest_tool_5', 'lock_plant_tool', 'lock_pick_tool')`);
        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" TYPE "public"."inventory_clan_type_enum" USING "type"::text::"public"."inventory_clan_type_enum"`);
        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" SET DEFAULT 'plant'`);
    }
}
