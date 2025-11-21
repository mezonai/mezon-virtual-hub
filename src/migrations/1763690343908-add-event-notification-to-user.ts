import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventNotificationToUser1763690343908
  implements MigrationInterface
{
  name = 'AddEventNotificationToUser1763690343908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
           ALTER TABLE "user"
           ADD COLUMN "show_event_notification" BOOLEAN NOT NULL DEFAULT false
       `);

    await queryRunner.query(`
           ALTER TABLE "user"
           ADD COLUMN "last_show_event_date" DATE
       `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
           ALTER TABLE "user"
           DROP COLUMN "last_show_event_date"
       `);

    await queryRunner.query(`
           ALTER TABLE "user"
           DROP COLUMN "show_event_notification"
       `);
  }
}
