import { BaseService } from '@libs/base/base.service';
import { MapEntity } from '@modules/map/entity/map.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '@types';
import { plainToInstance } from 'class-transformer';
import { DataSource, FindOptionsWhere, ILike, Not, Repository } from 'typeorm';
import {
  UpdateUserDto,
  UsersManagementQueryDto,
  UsersManagementResDto,
} from './dto/user-managment.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserManagementService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepository: Repository<MapEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(userRepository, UserEntity.name);
  }

  async getAllUsers(query: UsersManagementQueryDto) {
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      order = 'DESC',
      search,
    } = query;

    const where: FindOptionsWhere<UserEntity>[] = [];

    if (search) {
      where.push(
        { email: ILike(`%${search}%`) },
        { username: ILike(`%${search}%`) },
        { mezon_id: ILike(`%${search}%`) },
      );
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      relations: ['map'],
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sort_by]: order,
      },
    });

    const transformedUsers = plainToInstance(UsersManagementResDto, users);

    return new Pageable(transformedUsers, {
      size: limit,
      page,
      total,
    });
  }

  async updateUserInfo(userId: string, payload: UpdateUserDto) {
    const user = await this.findOneNotDeletedById(userId);

    if (payload.mezon_id && !user.mezon_id) {
      const existedUser = await this.findOne({
        where: { mezon_id: payload.mezon_id },
      });

      if (existedUser) {
        throw new BadRequestException(
          `Mezon ID: ${payload.mezon_id} is already existed`,
        );
      }
    }

    await this.userRepository.update(userId, payload);

    Object.assign(user, payload);
    return user;
  }
}
