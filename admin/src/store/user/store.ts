import { create } from 'zustand';
import { UserStore } from './type';
import { IPaginationResponse } from '@/type/api';
import { User } from '@/models/user';
import { IQueryParams } from '@/hooks/useTableQueryParams';
import { getUsers } from '@/services/users/getUsers';

export const useUserStore = create<UserStore>((set, get) => ({
  users: {} as IPaginationResponse<User>,
  fetchUsers: async (params: IQueryParams) => {
    if (get().users) {
      const users = await getUsers(params);
      if (users) {
        return set({ users });
      } else {
        return set({});
      }
    }
  },
}));
