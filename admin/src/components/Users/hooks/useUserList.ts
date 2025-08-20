import { useEffect, useRef, useState } from 'react';
import { useTableQueryParams } from '@/hooks/useTableQueryParams';
import httpClient from '@/services/httpService/httpServices';
import { IPaginationResponse } from '@/type/api';
import { User } from '@/models/user';

interface APIResponse {
  data: IPaginationResponse<User>;
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
    limit,
    page,
    sortBy,
    search,
    order,
    confirmSearch,
    setConfirmSearch,
  } = useTableQueryParams();

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
          params: queryParam,
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
  }, [queryParam]);

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
  };
};
