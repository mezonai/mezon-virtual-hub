import React from 'react';
import Layout from '../../components/Layout/Layout';
import { TransactionList } from '../../components/Transaction/TransactionList';

export const TransactionPage = (): React.JSX.Element => {
  return (
    <Layout>
      <TransactionList />
    </Layout>
  );
};
