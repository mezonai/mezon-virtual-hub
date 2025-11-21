import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnSpentAmoutToClanFunds1763715758122
    implements MigrationInterface {
    name = 'AddColumnSpentAmoutToClanFunds1763715758122';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE clan_funds
                ADD COLUMN spent_amount INT NOT NULL DEFAULT 0;
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE clan_funds
                DROP COLUMN spent_amount;
            `);
    }
}
