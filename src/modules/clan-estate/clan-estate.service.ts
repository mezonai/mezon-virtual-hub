import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@libs/base/base.service';
import { ClanEstateEntity } from './entity/clan-estate.entity';
import {
  CreateClanEstateDto,
  ClanEstateQueryDto,
} from './dto/clan-estate.dto';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';

@Injectable()
export class ClanEstateService extends BaseService<ClanEstateEntity> {
  constructor(
    @InjectRepository(ClanEstateEntity)
    private readonly clanEstateRepo: Repository<ClanEstateEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepo: Repository<MapEntity>,
  ) {
    super(clanEstateRepo, ClanEstateEntity.name);
  }

  async getAllClanEstates(query: ClanEstateQueryDto) {
    const qb = this.clanEstateRepo
      .createQueryBuilder('estate')
      .leftJoinAndSelect('estate.clan', 'clan')
      .leftJoinAndSelect('estate.realEstate', 'map')
      .orderBy('map.index', 'ASC');

    if (query.clan_id) {
      qb.andWhere('clan.id = :clan_id', {
        clan_id: query.clan_id,
      });
    }

    return qb.getMany();
  }

  async getClanEstateById(id: string) {
    const estate = await this.clanEstateRepo.findOne({
      where: { id },
      relations: ['clan', 'realEstate'],
    });

    if (!estate) {
      throw new NotFoundException('Clan estate not found');
    }

    return estate;
  }

  async createClanEstate(dto: CreateClanEstateDto) {
    const clan = await this.clanRepo.findOne({
      where: { id: dto.clan_id },
    });

    if (!clan) {
      throw new BadRequestException('Clan not found');
    }

    const map = await this.mapRepo.findOne({
      where: { id: dto.map_id },
    });

    if (!map) {
      throw new BadRequestException('Map not found');
    }

    const existedEstate =
      await this.clanEstateRepo.findOne({
        where: {
          clan: { id: dto.clan_id },
          realEstate: { id: dto.map_id },
        },
        relations: ['clan', 'realEstate'],
      });

    if (existedEstate) {
      throw new BadRequestException(
        'Clan already owns this map',
      );
    }

    const clanEstate = this.clanEstateRepo.create({
      clan,
      realEstate: map,
    });

    return this.clanEstateRepo.save(clanEstate);
  }

  async deleteClanEstateById(id: string) {
    const estate = await this.getClanEstateById(id);
    await this.clanEstateRepo.remove(estate);
    return { success: true };
  }
}
