import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsEquippedToAnimal1747728912996 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'animal',
            new TableColumn({
                name: 'is_brought',
                type: 'boolean',
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('animal', 'is_brought');
    }
}
