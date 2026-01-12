import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFkClanWarehouse1767954137087 implements MigrationInterface {
    name = 'UpdateFkClanWarehouse1767954137087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            DROP CONSTRAINT IF EXISTS "FK_item_id_warehouse"
        `);
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            ADD COLUMN IF NOT EXISTS plant_id uuid
        `);
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            ALTER COLUMN item_id DROP NOT NULL
        `);
        await queryRunner.query(`
            UPDATE clan_warehouses
            SET plant_id = item_id
            WHERE item_id IS NOT NULL
        `);
        await queryRunner.query(`
            UPDATE clan_warehouses
            SET item_id = NULL
        `);
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            ADD CONSTRAINT FK_warehouse_plant
            FOREIGN KEY (plant_id) REFERENCES plants(id)
            ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            ADD CONSTRAINT FK_warehouse_item
            FOREIGN KEY (item_id) REFERENCES item(id)
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            DROP CONSTRAINT IF EXISTS FK_warehouse_item
        `);
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            DROP CONSTRAINT IF EXISTS FK_warehouse_plant
        `);
        await queryRunner.query(`
            ALTER TABLE clan_warehouses
            DROP COLUMN IF EXISTS plant_id
        `);
    }

}
