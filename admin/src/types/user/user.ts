import { User } from '../../models/user';
import { SortOrder } from '../user';

export type userParams = {
  page: number;
  limit: number;
  search: string;
  sort_by: keyof User;
  order: SortOrder;
};
