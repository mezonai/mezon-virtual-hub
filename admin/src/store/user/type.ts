import { IQueryParams } from '@/hooks/useTableQueryParams';
import { User } from '@/models/user';
import { IPaginationResponse } from '@/type/api';

export interface UserStore {
  users: IPaginationResponse<User>;
  fetchUsers: (params: IQueryParams) => Promise<void>;
}
