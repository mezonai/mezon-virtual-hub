import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequiredAdmin } from './components/Auth/RequiredAdmin';
import { RequiredLogin } from './components/Auth/RequiredLogin';
import theme from './theme';
import { ThemeProvider } from '@mui/material';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { paths } from './utils/paths';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingPage } from './pages/SettingPage';
import { AccountPage } from './pages/AccountPage';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<RequiredLogin />}>
            <Route element={<RequiredAdmin />}>
              <Route
                path={paths.dashboard.overview}
                element={<DashboardPage />}
              />
              <Route path={paths.dashboard.users} element={<UsersPage />} />
              <Route
                path={paths.dashboard.settings}
                element={<SettingPage />}
              />
              <Route path={paths.dashboard.account} element={<AccountPage />} />
            </Route>

            <Route path="/unauthorized" element={<></>} />
            <Route path="/contact" element={<></>} />
          </Route>

          <Route path="/about" element={<></>} />
          <Route path={paths.auth.login} element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
export default App;
