import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInventoryClanEnum1767950631204 implements MigrationInterface {
    name = 'UpdateInventoryClanEnum1767950631204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "inventory_clan_type_enum"
            RENAME TO "inventory_clan_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "inventory_clan_type_enum" AS ENUM (
                'plant',
                'harvest_tool_1',
                'harvest_tool_2',
                'harvest_tool_3',
                'harvest_tool_4',
                'harvest_tool_5',
                'growth_plant_tool_1',
                'growth_plant_tool_2',
                'growth_plant_tool_3',
                'growth_plant_tool_4',
                'growth_plant_tool_5',
                'interrupt_harvest_tool_1',
                'interrupt_harvest_tool_2',
                'interrupt_harvest_tool_3',
                'interrupt_harvest_tool_4',
                'interrupt_harvest_tool_5',
                'lock_plant_tool',
                'lock_pick_tool'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "clan_warehouses"
            ALTER COLUMN "type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "clan_warehouses"
            ALTER COLUMN "type"
            TYPE "inventory_clan_type_enum"
            USING LOWER("type"::text)::"inventory_clan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "clan_warehouses"
            ALTER COLUMN "type"
            SET DEFAULT 'plant'
        `);

        await queryRunner.query(`
            DROP TYPE "inventory_clan_type_enum_old"
        `);
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "inventory_clan_type_enum_old" AS ENUM (
                'PLANT',
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "clan_warehouses"
            ALTER COLUMN "type" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "clan_warehouses"
            ALTER COLUMN "type"
            TYPE "inventory_clan_type_enum_old"
            USING UPPER("type"::text)::"inventory_clan_type_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "clan_warehouses"
            ALTER COLUMN "type"
            SET DEFAULT 'PLANT'
        `);
        await queryRunner.query(`
            DROP TYPE "inventory_clan_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "inventory_clan_type_enum_old"
            RENAME TO "inventory_clan_type_enum"
        `);
    }

}
