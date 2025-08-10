import { useCallback, useEffect, useMemo, useState } from 'react';
import httpClient from '../../../services/httpService/httpServices';
import { User } from '../../../models/user';
import { SortOrder } from '../../../types/user';
import { useSearchParams } from 'react-router-dom';

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

  const [searchParam, setSearchParam] = useSearchParams();
  const [confirmSearch, setConfirmSearch] = useState<string>('');

  const queryParam = useMemo(() => {
    return {
      page: Number(searchParam.get('page') || '1'),
      limit: Number(searchParam.get('limit') || '5'),
      search: searchParam.get('search') || '',
      sort_by: (searchParam.get('sort_by') as keyof User) || 'created_at',
      order: (searchParam.get('order') as SortOrder) || SortOrder.DESC,
    };
  }, [searchParam]);

  useEffect(() => {
    let active = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get<APIResponse>('/admin/users', {
          params: {
            search: queryParam.search ?? undefined,
            page: queryParam.page ? queryParam.page + 1 : 1,
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

  const handleParamsChange = useCallback(
    (params: Partial<typeof queryParam>) => {
      const urlSearchParam = new URLSearchParams(searchParam);
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'page') {
          const pageNumber = Number(value);
          if (pageNumber < 1) {
            return;
          }
        }
        urlSearchParam.set(key, String(value));
      });
      setSearchParam(urlSearchParam);
    },
    [searchParam, setSearchParam],
  );

  return {
    users,
    loading,
    error,
    page: queryParam.page,
    limit: queryParam.limit,
    totalPages,
    totalItems,
    hasNextPage: queryParam.page < totalPages,
    hasPreviousPage: queryParam.page > 1,
    sortBy: queryParam.sort_by,
    order: queryParam.order,
    search: queryParam.search,
    setConfirmSearch,
    confirmSearch,
    handleParamsChange,
  };
};
