import { plainToClass } from 'class-transformer';
import { UserEntity } from './entity/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto, UserInformationDto } from './dto/user.dto';
import { MapEntity } from '@modules/map/entity/map.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepository: Repository<MapEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async getUserInformation(userId: string): Promise<UserInformationDto> {
    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.inventories', 'inventory')
      .leftJoinAndSelect('inventory.item', 'item')
      .leftJoinAndSelect('user.map', 'map')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!userInfo) {
      throw new Error('User not found in the database');
    }

    return plainToClass(UserInformationDto, {
      user: {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        position_x: userInfo.position_x,
        position_y: userInfo.position_y,
        avatar_url: userInfo.avatar_url,
      },
      inventories: userInfo.inventories,
      map: userInfo.map,
    });
  }

  async updateUser(userId: string, updateDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.mapId) {
      const map = await this.mapRepository.findOne({ where: { id: updateDto.mapId } });
      if (!map) {
        throw new NotFoundException('Map not found');
      }
      user.map = map;
    }

    if (updateDto.inventoryIds && updateDto.inventoryIds.length > 0) {
      const inventories = await this.inventoryRepository.findByIds(updateDto.inventoryIds);
      if (inventories.length !== updateDto.inventoryIds.length) {
        throw new NotFoundException('One or more inventories not found');
      }
      user.inventories = inventories;
    }

    user.username = updateDto.username || user.username;
    user.email = updateDto.email || user.email;
    user.avatar_url = updateDto.avatar_url || user.avatar_url;
    user.position_x = updateDto.position_x || user.position_x;
    user.position_y = updateDto.position_y || user.position_y;

    return this.userRepository.save(user);
  }

  async getUsersByMapId(mapId: string): Promise<UserEntity[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('map_id = :mapId', { mapId })
      .getMany();

    return users;
  }
}
