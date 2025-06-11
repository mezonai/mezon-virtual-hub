import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeItemName1749531682715 implements MigrationInterface {
    name = 'ChangeItemName1749531682715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE item SET name = 'Áo dài cam bông' WHERE name = 'Áo dài đỏ bông';
            UPDATE item SET name = 'Áo dài đỏ bông' WHERE name = 'Áo dài xanh bông';
            UPDATE item SET name = 'Áo dài xanh bông' WHERE name = 'Áo crop top trắng';
            UPDATE item SET name = 'Áo crop top trắng' WHERE name = 'Áo đồ bộ mèo';
            UPDATE item SET name = 'Áo đồ bộ mèo' WHERE name = 'Áo trắng phồng phồng';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE item SET name = 'Áo trắng phồng phồng' WHERE name = 'Áo đồ bộ mèo';
            UPDATE item SET name = 'Áo đồ bộ mèo' WHERE name = 'Áo crop top trắng';
            UPDATE item SET name = 'Áo crop top trắng' WHERE name = 'Áo dài xanh bông';
            UPDATE item SET name = 'Áo dài xanh bông' WHERE name = 'Áo dài đỏ bông';
            UPDATE item SET name = 'Áo dài đỏ bông' WHERE name = 'Áo dài cam bông';
        `);
    }

}
