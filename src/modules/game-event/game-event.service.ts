import { BaseService } from '@libs/base/base.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { GameEventResDto, SaveEventGameDto } from './dto/game-event.dto';
import { GameEventEntity } from './entity/game-event.entity';

@Injectable()
export class GameEventService extends BaseService<GameEventEntity> {
  constructor(
    @InjectRepository(GameEventEntity)
    private readonly gameEventRepository: Repository<GameEventEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(gameEventRepository, GameEventService.name);
  }

  async findAll() {
    const events = await this.gameEventRepository.find({
      order: { start_time: 'ASC' },
    });
    return plainToInstance(GameEventResDto, events);
  }

  async saveEvent(dto: SaveEventGameDto, id?: string) {
    let event: GameEventEntity;

    if (id) {
      event = await this.gameEventRepository.findOneByOrFail({ id });
    } else {
      event = this.gameEventRepository.create();
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.target_user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `Target User with ID ${dto.target_user_id} not found`,
      );
    }

    event.target_user = user;

    Object.assign(event, dto);

    await this.gameEventRepository.save(event);
  }

  async completeEvent(eventId: string, user: UserEntity) {
    const event = await this.gameEventRepository.findOne({
      where: { id: eventId },
      relations: ['completed_users'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const now = new Date();
    if (now < event.start_time) {
      throw new BadRequestException('Event has not started yet');
    }

    if (now > event.end_time) {
      throw new BadRequestException('Event has already ended');
    }

    event.completed_users = [...event.completed_users, user];

    if (event.completed_users.length > event.max_completed_users) {
      throw new BadRequestException(
        `Event has already reached the maximum number of completed users`,
      );
    }

    await this.gameEventRepository.save(event);
  }

  async findOneUpcoming() {
    const event = await this.gameEventRepository.findOne({
      where: {
        start_time: MoreThan(new Date()),
        is_completed: false,
      },
      order: { start_time: 'ASC' },
    });

    return plainToInstance(GameEventResDto, event);
  }

  async findOneCurrentEvent() {
    const event = await this.gameEventRepository.findOne({
      where: {
        start_time: LessThan(new Date()),
        end_time: MoreThan(new Date()),
        is_completed: false,
      },
      order: { start_time: 'ASC' },
    });

    return plainToInstance(GameEventResDto, event);
  }

  async findOneWithCompletedUsers(event_id: string) {
    const event = await this.gameEventRepository.findOne({
      where: { id: event_id },
      relations: ['completed_users'],
      order: { start_time: 'ASC' },
    });

    if (!event) {
      throw new NotFoundException('Game event not found');
    }

    return plainToInstance(GameEventResDto, event);
  }
}