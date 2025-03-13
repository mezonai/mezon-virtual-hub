import { MapEntity } from '@modules/map/entity/map.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
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
        gold: userInfo.gold,
        gender: userInfo.gender,
        display_name: userInfo.display_name,
      },
      inventories: userInfo.inventories,
      map: userInfo.map,
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

      user.map = map;
    }

    const { map_id, ...filteredData } = updateDto;

    const dataToUpdate = Object.fromEntries(
      Object.entries(filteredData).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

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
}
