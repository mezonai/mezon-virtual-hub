import { FARM_CONFIG } from '@constant/farm.constant';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDataPlant1761275702923 implements MigrationInterface {
  name = 'SeedDataPlant1761275702923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const basePlants = [
      {
        name: 'Broccoli',
        grow_time_minutes: 10,
        description:'Bông cải xanh, loại rau bổ dưỡng giàu vitamin và khoáng chất, thường dùng trong các món xào và luộc.',
      },
      {
        name: 'Chilli',
        grow_time_minutes: 20,
        description:'Ớt cay nồng, dễ trồng và được dùng phổ biến trong nấu ăn để tăng hương vị món ăn.',
      },
      {
        name: 'Corn',
        grow_time_minutes: 30,
        description:'Ngô vàng, cây trồng quen thuộc cho năng suất cao, có thể dùng làm thực phẩm hoặc thức ăn chăn nuôi.',
      },
      {
        name: 'Eggplant',
        grow_time_minutes: 45,
        description:'Cà tím, loại rau dễ trồng, có màu tím đặc trưng và thường xuất hiện trong các món kho hoặc nướng.',
      },
      {
        name: 'Garlic',
        grow_time_minutes: 60,
        description:'Tỏi, cây trồng quen thuộc có mùi hăng, được dùng làm gia vị và có nhiều lợi ích cho sức khỏe.',
      },
      {
        name: 'Potato',
        grow_time_minutes: 90,
        description:'Khoai tây, cây trồng phổ biến, củ chứa nhiều tinh bột và được dùng trong nhiều món ăn.',
      },
      {
        name: 'Pumpkin',
        grow_time_minutes: 120,
        description:'Bí đỏ, cây dây leo cho quả lớn, thường dùng nấu canh hoặc làm bánh.',
      },
      {
        name: 'Strawberry',
        grow_time_minutes: 150,
        description:'Dâu tây, cây thân thấp, cho quả đỏ ngọt, được nhiều người ưa chuộng.',
      },
      {
        name: 'Watermelon',
        grow_time_minutes: 180,
        description:'Dưa hấu, cây trồng mùa hè cho quả to, mọng nước và vị ngọt mát.',
      },
      {
        name: 'Grape',
        grow_time_minutes: 240,
        description:'Nho, loại cây trồng lâu năm, cho quả mọng ngọt dùng làm rượu vang hoặc ăn tươi.',
      },
    ];

    for (const plant of basePlants) {
      const grow_time_seconds = FARM_CONFIG.PLANT.FORMULA.growTimeSeconds(plant.grow_time_minutes);
      const harvest_point = FARM_CONFIG.PLANT.FORMULA.harvestPoint(plant.grow_time_minutes);
      const buy_price = FARM_CONFIG.PLANT.FORMULA.buyPrice(plant.grow_time_minutes);

      await queryRunner.query(`
        INSERT INTO plants (name, grow_time, harvest_point, buy_price, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) ON CONFLICT (name) DO UPDATE SET grow_time = EXCLUDED.grow_time, harvest_point = EXCLUDED.harvest_point, buy_price = EXCLUDED.buy_price, description = EXCLUDED.description, updated_at = NOW();
        `,
        [
          plant.name,
          grow_time_seconds,
          harvest_point,
          buy_price,
          plant.description,
        ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE plants DROP CONSTRAINT IF EXISTS unique_plant_name;`,
    );

    const names = ['Broccoli','Chilli','Corn','Eggplant','Garlic','Potato','Pumpkin','Strawberry','Watermelon','Grape'];
    for (const name of names) {
      await queryRunner.query(`DELETE FROM plants WHERE name = $1`, [name]);
    }
  }
}
