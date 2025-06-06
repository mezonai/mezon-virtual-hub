import { MapEntity } from '@modules/map/entity/map.entity';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { FindOneOptions, Repository } from 'typeorm';
import { UpdateInfoDto, UserInformationDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepository: Repository<MapEntity>,
  ) {}

  async getUserInformation(userId: string): Promise<UserInformationDto> {
    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.inventories', 'inventory')
      .leftJoinAndSelect('user.animals', 'animal')
      .leftJoinAndSelect('inventory.item', 'item')
      .leftJoinAndSelect('inventory.food', 'food')
      .leftJoinAndSelect('user.map', 'map')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!userInfo) {
      throw new Error('User not found in the database');
    }

    const { inventories, map, animals, ...user } = userInfo;

    return plainToClass(UserInformationDto, {
      user,
      inventories,
      map,
      animals,
    });
  }

  async updateUserInfo(user: UserEntity, updateDto: UpdateInfoDto) {
    if (updateDto.map_id) {
      const map = await this.mapRepository.findOne({
        where: { id: updateDto.map_id, is_locked: false },
      });

      if (!map) {
        throw new NotFoundException('Map not found or be locked');
      }

      if (user.id !== updateDto.map_id) {
        user.position_x = map.default_position_x;
        user.position_y = map.default_position_y;
      }

      user.map = map;
    }

    const { map_id, ...filteredData } = updateDto;

    const dataToUpdate = Object.fromEntries(
      Object.entries(filteredData).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    // Prevent user updates gender second times
    if (user.gender) {
      delete dataToUpdate.gender;
    }

    Object.assign(user, dataToUpdate);

    await this.userRepository.update(user.id, user);
  }

  async getUsersByMapId(mapId: string): Promise<UserEntity[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('map_id = :mapId', { mapId })
      .getMany();

    return users;
  }

  async findOne(options: FindOneOptions<UserEntity>) {
    return await this.userRepository.findOne(options);
  }
}
