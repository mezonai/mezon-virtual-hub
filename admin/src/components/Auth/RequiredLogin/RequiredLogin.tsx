import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// Basic Auth Middleware
export const RequiredLogin: React.FC = () => {
  const navigate = useNavigate();
  const hasAccessToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!hasAccessToken) {
      navigate('/login');
    }
  }, [hasAccessToken, navigate]);

  return <Outlet />;
};
