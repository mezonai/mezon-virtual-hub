import { configEnv } from "@config/env.config";
import { UserEntity } from "@modules/user/entity/user.entity";
import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedMezonBotUser1755768582534 implements MigrationInterface {
    name = 'SeedMezonBotUser1755768582534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const bot: Partial<UserEntity> = {
            username: 'mezon_bot',
            mezon_id: configEnv().MEZON_TOKEN_RECEIVER_APP_ID,
            display_name: 'Virtual-Hub'
        };
        await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into('user')
            .values(bot)
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "user" 
            WHERE username = 'mezon_bot'
        `);
    }

}
