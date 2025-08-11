import { useCallback, useEffect, useState } from 'react';
import { useTransactionStore } from '../../../store/transaction/store';
import { Transaction } from '../../../types/transaction/transaction';
import { useTableQueryParams } from '../../../hooks/useTableQueryParams';

export const useTransactionList = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchTransaction, transactions } = useTransactionStore();
  const { queryParam, handleParamsChange, limit, page, sortBy, search, order } =
    useTableQueryParams<Transaction>();
  const [confirmSearch, setConfirmSearch] = useState<string>('');

  const totalItem = transactions.total;
  const totalPage = transactions.total_page;
  const transactionData = transactions.result;

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

  return {
    transactionData,
    totalItem,
    totalPage,
    hasNextPage: queryParam.page < totalPage,
    hasPreviousPage: queryParam.page + 1,
    loading,
    limit,
    page,
    sortBy,
    search,
    order,
    confirmSearch,
    handleParamsChange,
    setConfirmSearch,
  };
};
