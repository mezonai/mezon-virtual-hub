import { useEffect, useState } from 'react';
import httpClient from '../../../services/httpService/httpServices';
import { ActionFormType, User } from '../../../models/user';

interface UserListResponse {
  result: User[];
  page: number;
  size: number;
  total: number;
  total_page: number;
  has_previous_page: boolean;
  has_next_page: boolean;
}

interface APIResponse {
  data: UserListResponse;
}

export const useUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Pagination & Query params
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [confirmSearch, setConfirmSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof User>('created_at');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [openFormModal, setOpenFormModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [actionType, setActionType] = useState<ActionFormType | null>(null);
  const [isDisableBtnSave, setIsDisableBtnSave] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get<APIResponse>('/admin/users', {
          params: {
            search: confirmSearch ?? undefined,
            page: page ? page + 1 : 1,
            limit,
            sort_by: sortBy,
            order,
          },
        });

        if (active) {
          setUsers(res.data.data.result);
          setTotalPages(res.data.data.total_page);
          setTotalItems(res.data.data.total);
        }
      } catch (err: any) {
        if (active) setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      active = false;
    };
  }, [page, limit, sortBy, order, confirmSearch]);

  return {
    users,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    sortBy,
    order,
    search,
    openFormModal,
    selectedUser,
    actionType,
    setSelectedUser,
    setActionType,
    setOpenFormModal,
    setPage,
    setLimit,
    setSearch,
    setConfirmSearch,
    setSortBy,
    setOrder,
    isDisableBtnSave,
    setIsDisableBtnSave,
  };
};
