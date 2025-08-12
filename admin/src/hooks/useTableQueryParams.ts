import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SortOrder } from '../types/user';

export function useTableQueryParams<T>() {
  const [searchParam, setSearchParam] = useSearchParams();
  const [confirmSearch, setConfirmSearch] = useState<string>('');
  const queryParam = useMemo(() => {
    return {
      page: Number(searchParam.get('page') || '1'),
      limit: Number(searchParam.get('limit') || '5'),
      search: searchParam.get('search') || '',
      sort_by: (searchParam.get('sort_by') as keyof T) || 'created_at',
      order: (searchParam.get('order') as SortOrder) || SortOrder.DESC,
    };
  }, [searchParam]);

  const handleParamsChange = useCallback(
    (params: Partial<typeof queryParam>) => {
      let urlSearchParam: URLSearchParams = new URLSearchParams(searchParam);
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'search') {
          urlSearchParam = new URLSearchParams();
          if (value) {
            urlSearchParam.set('search', String(value));
          }
        } else {
          if (!urlSearchParam) {
            urlSearchParam = new URLSearchParams(searchParam);
          }
          if (key === 'page') {
            const pageNumber = Number(value);
            if (pageNumber < 1) {
              return;
            }
          }
          urlSearchParam.set(key, String(value));
        }
      });
      setSearchParam(urlSearchParam);
    },
    [searchParam, setSearchParam],
  );

  useEffect(() => {
    setConfirmSearch(queryParam.search);
  }, [setConfirmSearch, queryParam.search]);

  return {
    queryParam,
    limit: queryParam.limit,
    page: queryParam.page,
    sortBy: queryParam.sort_by,
    search: queryParam.search,
    order: queryParam.order,
    handleParamsChange,
    setSearchParam,
    searchParam,
    setConfirmSearch,
    confirmSearch,
  };
}
