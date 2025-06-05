import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDescriptionToFood1747999211779 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'food',
            new TableColumn({
                name: 'description',
                type: 'text',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('food', 'description');
    }
}
