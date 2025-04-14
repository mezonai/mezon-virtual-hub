import { TokenSentEvent } from 'mezon-sdk';

export interface MezonTokenSentEvent extends TokenSentEvent {
  transaction_id?: string;
  extra_attribute?: string;
}
