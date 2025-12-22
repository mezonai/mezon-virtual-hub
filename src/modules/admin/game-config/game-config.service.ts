import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameConfigEntity } from './entity/game-config.entity';
import { GameConfigStore } from './game-config.store';
import { GameConfigKey } from '@constant/game-config.keys';
import { merge } from 'lodash';

@Injectable()
export class gameConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(GameConfigEntity)
    private readonly repo: Repository<GameConfigEntity>,
    private readonly store: GameConfigStore,
  ) {}
  async onModuleInit() {
    await this.loadAll();
  }
  async loadAll() {
    const rows = await this.repo.find({
      where: { enabled: true },
    });

    this.store.clear();

    for (const row of rows) {
      this.store.set(row.key as GameConfigKey, row.value);
    }

    console.log(`[Config] Loaded ${rows.length} configs`);
  }

  async reload() {
    await this.loadAll();
  }

  async findAll() {
    return this.repo.find({ order: { created_at: 'ASC' } });
  }

  async update(
    key: string,
    dto: { value?: any; enabled?: boolean },
  ) {
    const config = await this.repo.findOne({ where: { key } });
    if (!config) {
      throw new BadRequestException('Config not found');
    }

    if (dto.value) {
      config.value = merge({}, config.value, dto.value);
    }

    if (dto.enabled !== undefined) {
      config.enabled = dto.enabled;
    }

    await this.repo.save(config);
    await this.reload();
  }
}
