import React, { useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard/users');
  }, [navigate]);
  return (
    <Layout>
      <div>Dashboard Page</div>
    </Layout>
  );
};
