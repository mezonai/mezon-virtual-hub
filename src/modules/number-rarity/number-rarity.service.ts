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
    const numberRarity = this.numberRarityRepository.create(dto);
    return this.numberRarityRepository.save(numberRarity);
  }

  async findAll() {
    return this.numberRarityRepository.find();
  }

  async findByRoomCode(roomCode: string) {
    const numberRarity = await this.numberRarityRepository.findOne({
      where: { room_code: roomCode },
    });

    if (!numberRarity) throw new NotFoundException(`NumberRarity not found for room_code=${roomCode}`);

    return numberRarity;
  }

  async updateNumberRarity(roomCode: string, dto: UpdateNumberRarityDto) {
    const numberRarity = await this.findByRoomCode(roomCode);

    Object.assign(numberRarity, dto);
    return this.numberRarityRepository.save(numberRarity);
  }
}