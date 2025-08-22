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
import { ToastContainer, Zoom } from 'react-toastify';
import { TransactionPage } from './pages/TransactionPage';
import { Callback } from './components/Callback/Callback';
import { PetPlayersPage } from './pages/PetPlayersPage';
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
                path={paths.dashboard.transaction}
                element={<TransactionPage />}
              />
              <Route
                path={paths.dashboard.petPlayers}
                element={<PetPlayersPage />}
              />
            </Route>

            <Route path="/unauthorized" element={<></>} />
            <Route path="/contact" element={<></>} />
          </Route>

          <Route path="/about" element={<></>} />
          <Route path={paths.auth.login} element={<LoginPage />} />
          <Route path={paths.auth.callback} element={<Callback />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        closeButton={true}
        closeOnClick
        pauseOnHover
        pauseOnFocusLoss={false}
        transition={Zoom}
        toastClassName={() => 'min-w-[600px] h-full mb-[20px] cursor-pointer'}
      />
    </ThemeProvider>
  );
};
export default App;
