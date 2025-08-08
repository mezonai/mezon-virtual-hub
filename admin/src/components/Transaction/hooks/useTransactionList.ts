import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTransactionStore } from '../../../store/transaction/store';
import { Transaction } from '../../../models/transaction/transaction';
import { SortOrder } from '../../../types/user';

export const useTransactionList = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchTransaction, transactions } = useTransactionStore();

  const [confirmSearch, setConfirmSearch] = useState<string>('');
  const [searchParam, setSearchParam] = useSearchParams();

  const toatalItem = transactions.total;
  const totalPage = transactions.total_page;
  const transactionData = transactions.result;

  const queryParam = useMemo(() => {
    return {
      page: Number(searchParam.get('page') || '1'),
      limit: Number(searchParam.get('limit') || '5'),
      search: searchParam.get('search') || '',
      sort_by:
        (searchParam.get('sort_by') as keyof Transaction) || 'created_at',
      order: (searchParam.get('order') as SortOrder) || SortOrder.DESC,
    };
  }, [searchParam]);

  const fetchDataTransaction = useCallback(async () => {
    setLoading(true);
    try {
      await fetchTransaction(queryParam);
    } finally {
      setLoading(false);
    }
  }, [fetchTransaction, queryParam]);

  useEffect(() => {
    fetchDataTransaction();
  }, [fetchDataTransaction]);

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
    transactionData,
    toatalItem,
    totalPage,
    hasNextPage: queryParam.page < totalPage,
    hasPreviousPage: queryParam.page + 1,
    loading,
    limit: queryParam.limit,
    page: queryParam.page,
    sortBy: queryParam.sort_by,
    search: queryParam.search,
    order: queryParam.order,
    confirmSearch,
    handleParamsChange,
    setConfirmSearch,
  };
};
