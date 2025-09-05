import { EventEmitter } from 'events';

export class EventCommon extends EventEmitter {
  private static _instance: EventCommon;

  private constructor() {
    super();
  }

  static get instance(): EventCommon {
    if (!this._instance) {
      this._instance = new EventCommon();
    }
    return this._instance;
  }
}

export const GlobalEventCommon = EventCommon.instance;
