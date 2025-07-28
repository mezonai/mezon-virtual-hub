import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequiredAdmin } from './components/Auth/RequiredAdmin';
import { RequiredLogin } from './components/Auth/RequiredLogin';
import theme from './theme';
import { ThemeProvider } from '@mui/material';
import { LoginPage } from './pages/LoginPage';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
    <BrowserRouter>
      <Routes>
        <Route element={<RequiredLogin />} >
          <Route path="/" element={<></>} />
          <Route path="/contact" element={<></>} />
  
          <Route element={<RequiredAdmin />} > 
            <Route path="/admin" element={<></>} />
          </Route>
  
          <Route path="/unauthorized" element={<></>} />
        </Route>
  
        {/* This route doesn't require login */}
        <Route path="/about" element={<></>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
};
export default App;
