import { useMemo } from 'react';
import { SortOrder } from '../type/enum/user';
import { useQueryParam } from './useQueryParam';

export interface IQueryParams {
  page: number;
  limit: number;
  search: string;
  sort_by: string;
  order: SortOrder;
}

export function useTableQueryParams<T extends Record<string, any>>() {
  const defaultParam: IQueryParams = useMemo(() => {
    return {
      page: 1,
      limit: 5,
      search: '',
      sort_by: 'created_at',
      order: SortOrder.DESC,
    };
  }, []);
  const { queryParam, handleParamsChange, searchParam, setSearchParam } =
    useQueryParam<Partial<T> & IQueryParams>({
      defaultParam: { ...defaultParam, ...({} as Partial<T>) },
      options: {
        resetOnSearch: true,
        validatePage: true,
      },
    });

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
  };
}
