import { useEffect, useState } from 'react';
import { User } from '../../../models/user';
import httpClient from '../../../services/httpServices';

export const useUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPages, setTotalPages] = useState<number | null>(null); // placeholder
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await httpClient.get('/admin/users', {
          params: {
            page,
            limit,
          },
        });
        if (active) {
          setUsers(res.data.data.data);
          // future: setTotalPages(res.totalPages);
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
  }, []);

  return {
    users,
    loading,
    error,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
  };
};
