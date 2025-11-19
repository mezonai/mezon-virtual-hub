import { QuestType } from '@enum';
import { GlobalEventCommon } from '@modules/shared/events/event-common';
import { EventTypes } from '@modules/shared/events/event-types.enum';

export interface QuestProgressPayload {
  userId: string;
  questKey: string;
  quantity?: number;
  label?: string;
}

export interface QuestCompletedPayload {
  userId: string;
  questKey: string;
}

export const QuestEventEmitter = {
  emitProgress(
    userId: string,
    questKey: QuestType,
    quantity = 1,
    nameOffice?: string,
  ) {
    GlobalEventCommon.emit(EventTypes.QUEST, {
      userId,
      questKey,
      quantity,
      label: nameOffice,
    });
  },

  emitNewbieLogin(userId: string) {
    GlobalEventCommon.emit(EventTypes.NEWBIE_LOGIN, userId);
  },

  emitEventLoginReward(userId: string) {
    GlobalEventCommon.emit(EventTypes.EVENT_LOGIN_REWARD, userId);
  },
};
