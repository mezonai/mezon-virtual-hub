import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class SeedNewItemSlot1768795133642 implements MigrationInterface {
    name = 'SeedNewItemSlot1768795133642';
    public async up(queryRunner: QueryRunner): Promise<void> {
        const filePath = path.resolve(__dirname, '../seeds/item-seeds.json');
        const fileData = fs.readFileSync(filePath, 'utf-8');

        const items: {
            id: string;
            name: string;
            type: string;
            gold: number;
            gender: string;
            item_code?: string | null;
        }[] = JSON.parse(fileData);

        for (const item of items) {
            const exists = await queryRunner.query(
                ` SELECT 1 FROM item WHERE id = $1 OR name = $2 `,
                [item.id, item.name],
            );

            if (exists.length > 0) {
                console.warn(`⚠️ Item đã tồn tại (skip): ${item.name}`);
                continue;
            }

            await queryRunner.query(
                ` INSERT INTO item ( id, name, type, gold, gender, item_code, is_stackable, is_purchasable, created_at, updated_at) VALUES ( $1, $2, $3, $4, $5, $6, true,false, NOW(), NOW())`,
                [item.id, item.name, item.type, item.gold, item.gender, item.item_code ?? null,],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const filePath = path.resolve(__dirname, '../seeds/item-seeds.json');
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const items: { id: string }[] = JSON.parse(fileData);
        await queryRunner.query(
            `DELETE FROM item WHERE id = ANY($1)`,
            [items.map((i) => i.id)],
        );
    }
}
