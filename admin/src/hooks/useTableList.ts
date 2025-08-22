import { useEffect, useRef, useState } from 'react';
import { IQueryParams, useTableQueryParams } from './useTableQueryParams';
import { IPaginationResponse } from '@/type/api';

interface useTableListProps<T> {
  fetchData: (params: IQueryParams) => Promise<void>;
  storeData: IPaginationResponse<T>;
}

export function useTableList<T>({
  fetchData,
  storeData,
}: useTableListProps<T>) {
  const { queryParam } = useTableQueryParams();
  const firstCallRef = useRef<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const totalItem = storeData.total;
  const totalPage = storeData.total_page;
  const responseData = storeData.result;

  useEffect(() => {
    if (firstCallRef.current) {
      firstCallRef.current = false;
      return;
    }
    setLoading(true);
    fetchData(queryParam).finally(() => setLoading(false));
  }, [queryParam, fetchData]);

  return {
    loading,
    totalItem,
    totalPage,
    responseData,
  };
}
