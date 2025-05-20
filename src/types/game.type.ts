import { Schema, type } from '@colyseus/schema';
import { TokenSentEvent } from 'mezon-sdk/dist/cjs/api/api';

export class Player extends Schema {
  @type('string') id: string = '';
  @type('string') user_id: string = '';
  @type('boolean') is_show_name: boolean;
  @type('string') display_name: string = '';
  @type('string') skin_set: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') animals: string = '';
}

export interface WithdrawPayload extends Pick<TokenSentEvent, 'amount' | 'note'> {}
