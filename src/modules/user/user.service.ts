import { BaseService } from '@libs/base/base.service';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { UpdateInfoDto, UserInformationDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  private readonly userLocks = new Set<string>();
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ClanEntity)
    private readonly mapRepository: Repository<ClanEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(userRepository, UserEntity.name);
  }

  async getUserInformation(userId: string): Promise<UserInformationDto> {
    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.inventories', 'inventory')
      .leftJoinAndSelect('inventory.item', 'item')
      .leftJoinAndSelect('inventory.food', 'food')
      .leftJoinAndSelect('user.clan', 'clans')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!userInfo) {
      throw new Error('User not found in the database');
    }

    if (!userInfo.isPlantTutorialCompleted) {
      userInfo.isPlantTutorialCompleted = true;
    }

    if (!userInfo.isPetTutorialCompleted) {
      userInfo.isPetTutorialCompleted = true;
    }

    const isTutorialUser = await this.userRepository.save(userInfo);

    const { inventories, clan, ...user } = isTutorialUser;

    return plainToClass(UserInformationDto, {
      user,
      inventories,
      clan,
    });
  }

  async updateUserInfo(user: UserEntity, updateDto: UpdateInfoDto) {
    if (updateDto.clan_id) {
      const map = await this.mapRepository.findOne({
        where: { id: updateDto.clan_id, is_locked: false },
      });

      if (!map) {
        throw new NotFoundException('Map not found or be locked');
      }

      if (user.id !== updateDto.clan_id) {
        user.position_x = map.default_position_x;
        user.position_y = map.default_position_y;
      }

      user.clan = map;
    }

    const { clan_id, ...filteredData } = updateDto;

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

  async findOne(options: FindOneOptions<UserEntity>) {
    return await this.userRepository.findOne(options);
  }

  async processUserTransaction<T>(
    userId: string,
    fn: (user: UserEntity) => Promise<T>,
  ): Promise<T> {
    if (this.userLocks.has(userId)) {
      throw new BadRequestException(
        'Another operation is already in progress for this user.',
      );
    }

    this.userLocks.add(userId);

    try {
      const user = await this.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return await fn(user);
    } finally {
      this.userLocks.delete(userId);
    }
  }

  async getShowEventStatus(userId: string): Promise<{
    show_event_notification: boolean;
    last_show_event_date: Date | null;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['show_event_notification', 'last_show_event_date'],
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      show_event_notification: user.show_event_notification,
      last_show_event_date: user.last_show_event_date || null,
    };
  }

  async updateShowEventNotification(userId: string, show: boolean) {
    const updateData: Partial<UserEntity> = { show_event_notification: show };

    if (show) {
      updateData.last_show_event_date = new Date();
    }

    const result = await this.userRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set(updateData)
      .where('id = :userId', { userId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
