import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSortIndexIntoQuestNewbieLogin1764236290750
  implements MigrationInterface
{
  name = 'AddSortIndexIntoQuestNewbieLogin1764236290750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const days = [
      'Ngày 1',
      'Ngày 2',
      'Ngày 3',
      'Ngày 4',
      'Ngày 5',
      'Ngày 6',
      'Ngày 7',
    ];

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const sortIndex = i + 1;

      await queryRunner.query(`
        UPDATE "quests"
        SET "sort_index" = ${sortIndex}
        WHERE "type" IN ('newbie_login', 'newbie_login_special')
          AND "name" = '${day}'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
