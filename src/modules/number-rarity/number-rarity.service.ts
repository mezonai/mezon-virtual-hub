import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateNumberRarityDto, UpdateNumberRarityDto } from '@modules/number-rarity/dto/number-rarity.dto';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class NumberRarityService extends BaseService<NumberRarityEntity> {
  constructor(
    @InjectRepository(NumberRarityEntity)
    private readonly numberRarityRepository: Repository<NumberRarityEntity>,
    private manager: EntityManager,
  ) {
    super(numberRarityRepository, NumberRarityEntity.name);
  }

  async createNumberRarity(dto: CreateNumberRarityDto) {
    const entity = this.numberRarityRepository.create(dto);
    return this.numberRarityRepository.save(entity);
  }

  async findAll() {
    return this.numberRarityRepository.find();
  }

  async findByRoomCode(roomCode: string) {
    const entity = await this.numberRarityRepository.findOne({
      where: { room_code: roomCode },
    });

    if (!entity) {
      throw new NotFoundException(
        `NumberRarity not found for room_code=${roomCode}`,
      );
    }

    return entity;
  }

  async updateNumberRarity(roomCode: string, dto: UpdateNumberRarityDto) {
    const entity = await this.findByRoomCode(roomCode);

    Object.assign(entity, dto);
    return this.numberRarityRepository.save(entity);
  }
}
