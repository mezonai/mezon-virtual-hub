import { useEffect, useRef, useState } from 'react';
import httpClient from '@/services/httpService/httpServices';
import { User } from '@/models/user';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';

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
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const firstCallRef = useRef<boolean>(true);
  const {
    queryParam,
    handleParamsChange,
    limit,
    page,
    sortBy,
    search,
    order,
    confirmSearch,
    setConfirmSearch,
  } = useTableQueryParams<User>();

  useEffect(() => {
    if (firstCallRef.current) {
      firstCallRef.current = false;
      return;
    }
    let active = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get<APIResponse>('/admin/users', {
          params: {
            search: queryParam.search,
            page: queryParam.page,
            limit: queryParam.limit,
            sort_by: queryParam.sort_by,
            order: queryParam.order,
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
  }, [
    queryParam.page,
    queryParam.limit,
    queryParam.sort_by,
    queryParam.order,
    queryParam.search,
  ]);

  return {
    users,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalItems,
    hasNextPage: queryParam.page < totalPages,
    hasPreviousPage: queryParam.page > 1,
    sortBy,
    order,
    search,
    setConfirmSearch,
    confirmSearch,
    handleParamsChange,
  };
};
