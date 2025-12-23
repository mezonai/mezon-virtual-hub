import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';
import { BaseService } from '@libs/base/base.service';
import { NumberRarityService } from '@modules/number-rarity/number-rarity.service';
import { CreateNumberRarityDto, UpdateNumberRarityDto } from '@modules/admin/number-rarity/dto/number-rarity.dto';

@Injectable()
export class AdminNumberRarityService extends BaseService<NumberRarityEntity> {
  constructor(
    @InjectRepository(NumberRarityEntity)
    private readonly numberRarityRepository: Repository<NumberRarityEntity>,
    private manager: EntityManager,
    private readonly numberRarityService: NumberRarityService,
  ) {
    super(numberRarityRepository, NumberRarityEntity.name);
  }

  async createNumberRarity(dto: CreateNumberRarityDto) {
    return this.numberRarityService.createNumberRarity(dto);
  }

  async updateNumberRarity(roomCode: string, dto: UpdateNumberRarityDto) {
    return this.numberRarityService.updateNumberRarity(roomCode, dto);
  }
}