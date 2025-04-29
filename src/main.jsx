import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';


import App from './App';
import AdminPedidos from './pages/AdminPedidos';
import EditarMenu from './pages/EditarMenu'; 
import DashboardAdmin from './pages/DashboardAdmin'; 
import AdminHome from './pages/AdminHome'; 
import HistorialAdmin from './pages/HistorialAdmin';
import ProduccionResumen from './pages/ProduccionResumen';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Routes>
      <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/editar-menu" element={<EditarMenu />} />
        <Route path="/admin/ver-pedidos" element={<AdminPedidos />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/historial" element={<HistorialAdmin />} />
        <Route path="/admin/produccion" element={<ProduccionResumen />} />
      </Routes>
    </Router>
  </ThemeProvider>
</React.StrictMode>

);
