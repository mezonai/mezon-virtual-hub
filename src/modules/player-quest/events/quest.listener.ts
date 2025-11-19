import { GlobalEventCommon } from '@modules/shared/events/event-common';
import { EventTypes } from '@modules/shared/events/event-types.enum';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PlayerQuestProgressService } from '../player-quest-progress.service';
import { QuestProgressPayload } from './quest.events';
import { QuestType } from '@enum';

@Injectable()
export class QuestListener implements OnModuleInit {
  constructor(
    private readonly questProgressService: PlayerQuestProgressService,
  ) {}

  onModuleInit() {
    GlobalEventCommon.on(EventTypes.QUEST, (data: QuestProgressPayload) => {
      this.questProgressService
        .addProgress(
          data.userId,
          data.questKey as any,
          data.quantity ?? 1,
          data.label,
        )
        .catch((err) => console.error('Quest progress update failed', err));
    });

    GlobalEventCommon.on(EventTypes.NEWBIE_LOGIN, (userId: string) => {
      this.questProgressService
        .completeQuestForUser(userId,[
          QuestType.NEWBIE_LOGIN,
          QuestType.NEWBIE_LOGIN_SPECIAL,
        ])
        .catch((err) => console.error('Quest progress update failed', err));
    });

    GlobalEventCommon.on(EventTypes.EVENT_LOGIN_REWARD, (userId: string) => {
      this.questProgressService
        .completeQuestForUser(userId, [
          QuestType.EVENT_LOGIN,
          QuestType.EVENT_LOGIN_SPECIAL,
        ])
        .catch((err) => console.error('Quest Event progress update failed', err));
    });
  }
}
