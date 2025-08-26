import { useEffect, useMemo, useRef, useState } from 'react';
import { IQueryParams, useTableQueryParams } from './useTableQueryParams';
import { IPaginationResponse } from '@/type/api';

interface useTableListProps<T> {
  fetchData: (params: IQueryParams) => Promise<void>;
  storeData: IPaginationResponse<T>;
  excludeParam?: string[] | string;
}

export function useTableList<T, P extends Record<string, any> = {}>({
  fetchData,
  storeData,
  excludeParam,
}: useTableListProps<T>) {
  const { queryParam } = useTableQueryParams<P>();
  const firstCallRef = useRef<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const totalItem = storeData.total;
  const totalPage = storeData.total_page;
  const responseData = storeData.result;

  const filterQueryParam = useMemo(() => {
    const filterQueryParam = { ...queryParam };
    if (typeof excludeParam === 'string') {
      delete filterQueryParam[excludeParam];
    } else if (Array.isArray(excludeParam)) {
      excludeParam.forEach((param) => {
        delete filterQueryParam[param];
      });
    }
    return filterQueryParam;
  }, [queryParam, excludeParam]);

  function hasExcludedParam(
    queryParams: Record<string, any>,
    excludeParams?: string[] | string,
  ): boolean {
    const excludes = Array.isArray(excludeParams)
      ? excludeParams
      : [excludeParams];
    return Object.keys(queryParams).some((key) => excludes?.includes(key));
  }

  useEffect(() => {
    if (firstCallRef.current) {
      firstCallRef.current = false;
      return;
    }
    if (hasExcludedParam(queryParam, excludeParam)) return;
    setLoading(true);
    fetchData(filterQueryParam).finally(() => setLoading(false));
  }, [filterQueryParam, fetchData]);

  return {
    loading,
    totalItem,
    totalPage,
    responseData,
  };
}
