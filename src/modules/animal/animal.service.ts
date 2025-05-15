import { BaseService } from '@libs/base/base.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EntityManager, Repository } from 'typeorm';
import { AnimalDtoRequest, AnimalDtoResponse } from './dto/animal.dto';
import { AnimalEntity } from './entity/animal.entity';
import { BaseGameRoom } from '@modules/colyseus/rooms/base-game.room';

@Injectable()
export class AnimalService extends BaseService<AnimalEntity> {
  constructor(
    @InjectRepository(AnimalEntity)
    private readonly animalRepository: Repository<AnimalEntity>,
    private manager: EntityManager,
  ) {
    super(animalRepository, AnimalEntity.name);
  }

  async getAnimals(user_id: string) {
    const animals = await this.find({ where: { user: { id: user_id } } });
    return plainToInstance(AnimalDtoResponse, animals);
  }

  async getAvailableAnimalsWithRoom(room_code: string) {
    const animals = await this.find({ where: { room_code, is_caught: false } });
    return plainToInstance(AnimalDtoResponse, animals);
  }

  async getAnimalById(id: string) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('Animal not found');
    }
    return item;
  }

  async createAnimal(payload: AnimalDtoRequest) {
    const animal = this.animalRepository.create({
      ...payload,
      room_code: `${payload.map}${payload.sub_map ? `-${payload.sub_map}` : ''}`,
    });

    return await this.save(animal);
  }

  async updateAnimal(updateAnimal: AnimalDtoRequest, animal_id: string) {
    const existedAnimal = await this.animalRepository.findOne({
      where: {
        id: animal_id,
      },
    });

    if (!existedAnimal) {
      throw new NotFoundException(`Animal ${animal_id} not found`);
    }

    Object.assign(existedAnimal, updateAnimal);

    await this.save({
      ...existedAnimal,
      room_code: `${updateAnimal.map}${updateAnimal.sub_map ? `-${updateAnimal.sub_map}` : ''}`,
    });
    return plainToInstance(AnimalDtoResponse, existedAnimal);
  }

  async deleteAnimal(id: string) {
    const result = await this.animalRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Animal not found');
    }
    return { deleted: true };
  }

  async catchAnimal(animal_id: string, user: UserEntity) : Promise<boolean> {
    const animal = await this.animalRepository.findOne({
      where: {
        id: animal_id,
        is_caught: false,
      },
    });

    if (!animal) {
      return false;
    }

    const randomValue = Math.random() * 100;

    if (randomValue <= animal.catch_percent) {
      animal.is_caught = true;
      animal.user = user;
      await this.animalRepository.save(animal);

      BaseGameRoom.activeRooms.forEach((room) => {
        if (room.roomName === animal.room_code) {
          console.log(room.roomName);

          room.broadcast('animalCaught', {
            animalId: animal.id,
            userId: user.id,
            username: user.username,
            roomCode: animal.room_code,
          });
        }
      });
    return true;  
    } 
    return false;
  }
}
