import { FoodType } from '@enum';
import { BaseService } from '@libs/base/base.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EntityManager, Repository } from 'typeorm';
import { FoodDto, FoodDtoRequest } from './dto/food.dto';
import { FoodEntity } from './entity/food.entity';

@Injectable()
export class FoodService extends BaseService<FoodEntity> {
  constructor(
    @InjectRepository(FoodEntity)
    private readonly foodRepository: Repository<FoodEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private manager: EntityManager,
  ) {
    super(foodRepository, FoodEntity.name);
  }

  async getAllFoods() {
    const foods = await this.find();
    return plainToInstance(FoodDto, foods);
  }

  async getFoodById(id: string) {
    const food = await this.findById(id);
    if (!food) {
      throw new Error('Food not found');
    }
    return food;
  }

  async createFood(createFoodDto: FoodDtoRequest) {
    const newFood = this.foodRepository.create(createFoodDto);
    await this.foodRepository.save(newFood);
    
    return plainToInstance(FoodDto, newFood);
  }

  async updateFood(updateFood: FoodDtoRequest, foodId: string) {
    const existedFood = await this.foodRepository.findOne({
      where: {
        id: foodId,
      },
    });

    if (!existedFood) {
      throw new NotFoundException(`Food ${foodId} not found`);
    }

    await this.foodRepository.update(foodId, updateFood);

    Object.assign(existedFood, updateFood);
    return plainToInstance(FoodDto, existedFood);
  }

  async getAllFoodsGroupedByType(): Promise<Record<FoodType, FoodEntity>> {
    const allFoods = await this.find();
    const result: Record<FoodType, FoodEntity> = {} as any;

    for (const food of allFoods) {
      result[food.type] = food;
    }

    return result;
  }

  async deleteFood(id: string) {
    const result = await this.foodRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Food not found');
    }
    return { deleted: true };
  }
}
