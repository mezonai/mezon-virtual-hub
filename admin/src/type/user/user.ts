import { SortOrder } from '../enum/user';

export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;

  [key: string]: unknown;
}

export type UserParams = {
  page: number;
  limit: number;
  search: string;
  sort_by: string;
  order: SortOrder;
};
