import { QuestType } from "@enum";
import { GlobalEventCommon } from "@modules/shared/events/event-common";
import { EventTypes } from "@modules/shared/events/event-types.enum";

export interface QuestProgressPayload {
  userId: string;
  questKey: string;
  quantity?: number;
}

export interface QuestCompletedPayload {
  userId: string;
  questKey: string;
}

export const QuestEventEmitter = {
  emitProgress(userId: string, questKey: QuestType, quantity = 1) {
    console.log(`Quest ${questKey} của user ${userId} đang làm`);
    GlobalEventCommon.emit(EventTypes.QUEST, { userId, questKey, quantity });
  },

  emitCompleted(userId: string, questKey: QuestType) {
    console.log(`Quest ${questKey} của user ${userId} đã hoàn thành`);
    GlobalEventCommon.emit(EventTypes.QUEST_COMPLETED, { userId, questKey });
  },
};
