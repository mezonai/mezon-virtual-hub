import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateClanWarehouseTypeToVarchar1770276750125 implements MigrationInterface {
    name = 'UpdateClanWarehouseTypeToVarchar1770276750125';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" DROP DEFAULT`);

        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" TYPE character varying(50) USING "type"::text`);

        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" SET DEFAULT 'plant'`);

        await queryRunner.query(`DROP TYPE IF EXISTS "public"."clan_warehouses_type_enum"`);

        await queryRunner.query(`DROP TYPE IF EXISTS "public"."inventory_clan_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."inventory_clan_type_enum" AS ENUM('plant', 'harvest_tool_1', 'harvest_tool_2', 'harvest_tool_3', 'harvest_tool_4', 'harvest_tool_5', 'growth_plant_tool_1', 'growth_plant_tool_2', 'growth_plant_tool_3', 'growth_plant_tool_4', 'growth_plant_tool_5', 'interrupt_harvest_tool_1', 'interrupt_harvest_tool_2', 'interrupt_harvest_tool_3', 'interrupt_harvest_tool_4', 'interrupt_harvest_tool_5', 'lock_plant_tool', 'lock_pick_tool')`);

        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" DROP DEFAULT`);

        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" TYPE "public"."inventory_clan_type_enum" USING "type"::text::"public"."inventory_clan_type_enum"`);

        await queryRunner.query(`ALTER TABLE "clan_warehouses" ALTER COLUMN "type" SET DEFAULT 'plant'`);
    }
}
