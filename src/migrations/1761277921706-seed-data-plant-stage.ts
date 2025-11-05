import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDataPlantStage1761277921706 implements MigrationInterface {
  name = 'SeedDataPlantStage1761277921706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE plant_stages
      ADD CONSTRAINT unique_plant_stage_per_plant UNIQUE (plant_id, stage_name);
    `);

    const plants: { id: string; grow_time: number }[] = await queryRunner.query(
      `SELECT id, grow_time FROM plants`,
    );
    const defaultStages = [
      {
        stage_name: 'SEED',
        ratio_start: 0,
        ratio_end: 0.3,
        description: 'Hạt vừa gieo',
      },
      {
        stage_name: 'SMALL',
        ratio_start: 0.3,
        ratio_end: 0.8,
        description: 'Cây nhỏ phát triển',
      },
      {
        stage_name: 'GROWN',
        ratio_start: 0.8,
        ratio_end: 1,
        description: 'Cây trưởng thành',
      },
      {
        stage_name: 'HARVESTABLE',
        ratio_start: 1,
        ratio_end: 1,
        description: 'Có thể thu hoạch',
      },
    ];

    const values: any[] = [];
    const placeholders: string[] = [];

    let idx = 0;
    for (const plant of plants) {
      for (const stage of defaultStages) {
        placeholders.push(
          `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, NOW(), NOW())`,
        );
        values.push(
          plant.id,
          stage.stage_name,
          stage.ratio_start,
          stage.ratio_end,
          stage.description,
        );
        idx += 5;
      }
    }

    if (values.length) {
      await queryRunner.query(`
        INSERT INTO plant_stages (plant_id, stage_name, ratio_start, ratio_end, description, created_at, updated_at)
        VALUES ${placeholders.join(', ')} ON CONFLICT (plant_id, stage_name)
        DO UPDATE SET
          ratio_start = EXCLUDED.ratio_start,
          ratio_end = EXCLUDED.ratio_end,
          description = EXCLUDED.description,
          updated_at = NOW()
        `,values
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const stageNames = ['SEED', 'SMALL', 'GROWN', 'HARVESTABLE'];
    await queryRunner.query(`
      DELETE FROM plant_stages WHERE stage_name = ANY($1)`,
      [stageNames],
    );

    await queryRunner.query(`
      ALTER TABLE plant_stages DROP CONSTRAINT IF EXISTS unique_plant_stage_per_plant;
    `);
  }
}
