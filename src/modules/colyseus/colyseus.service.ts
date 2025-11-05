import { GlobalEventCommon } from '@modules/shared/events/event-common';
import { EventTypes } from '@modules/shared/events/event-types.enum';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PlayerQuestProgressService } from '../player-quest/player-quest-progress.service';
import { QuestProgressPayload } from '../player-quest/events/quest.events';
import { InjectRepository } from '@nestjs/typeorm';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { Repository } from 'typeorm';
import { Room, Server } from 'colyseus';
import { createServer } from 'http';
import { GameRoom } from '@modules/colyseus/rooms/game.room';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { MapKey } from '@enum';
import { BattleRoom } from '@modules/colyseus/rooms/battle.room';
import { SUB_GAME_ROOM } from '@constant';
import { Logger } from '@libs/logger';
const logger = new Logger('Bootstrap');

@Injectable()
export class ColyseusService {
  constructor(
    @InjectRepository(ClanEntity)
    private readonly clanRepository: Repository<ClanEntity>,
  ) {}
  
  private app: INestApplication;
  async initialize(app: INestApplication) {
    this.app = app;
    return await this.setupColyseusServer(this.app);
  }

  defineRoomWithPaths(
    gameServer: Server,
    app: INestApplication<any>,
    baseKey: string,
    rooms = SUB_GAME_ROOM,
    parentPath = '',
  ) {
    Object.entries(rooms).forEach(([subPath, config]) => {
      const roomPath =
        `${baseKey}${parentPath}${subPath ? `-${subPath}` : ''}`.replace(
          /\/+/g,
          '-',
        ); // Ensure proper path format

      gameServer.define(roomPath, this.injectDeps(app, config.room));
      logger.log(`Defined game room: ${roomPath} ${config.room.name}`);

      if (config.children) {
        Object.entries(config.children).forEach(([childKey, childConfig]) => {
          this.defineRoomWithPaths(
            gameServer,
            app,
            baseKey,
            { [childKey]: childConfig },
            `${parentPath}/${subPath}`,
          );
        });
      }
    });

    gameServer.define('battle-room', this.injectDeps(app, BattleRoom));
  }

  async setupColyseusServer(app: INestApplication<any>) {
    const httpServer = createServer();
    const gameServer = new Server({
      transport: new WebSocketTransport({
        server: httpServer,
        pingInterval: 5000, // Send ping every 5 seconds
        pingMaxRetries: 3, // Disconnect after 3 failed pings
      }),
    });

    const clans = await this.clanRepository.find();
    for (const clan of clans) {
      this.defineRoomWithPaths(gameServer, app, clan.id);
    }
    return { gameServer, httpServer };
  }

  injectDeps<T extends { new (...args: any[]): Room }>(
    app: INestApplication,
    target: T,
  ): T {
    const selfDeps = Reflect.getMetadata('self:paramtypes', target) || [];
    const dependencies = Reflect.getMetadata('design:paramtypes', target) || [];

    selfDeps.forEach((dep: any) => {
      dependencies[dep.index] = dep.param;
    });

    const injectables =
      dependencies.map((dependency: any) => {
        return app.get(dependency);
      }) || [];

    return class extends target {
      constructor(...args: any[]) {
        super(...injectables);
      }
    };
  }
}
