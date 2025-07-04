import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import LandingAuth from './pages/LandingAuth';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MainApp from './MainApp';
import QuienesSomos from './pages/QuienesSomos';

import AdminHome from './pages/AdminHome';
import AdminPedidos from './pages/AdminPedidos';
import EditarMenu from './pages/EditarMenu';
import DashboardAdmin from './pages/DashboardAdmin';
import HistorialAdmin from './pages/HistorialAdmin';
import ProduccionResumen from './pages/ProduccionResumen';
import EditarPrecios from './pages/EditarPrecios';
import CrearMenuDelDia from './pages/CrearMenuDelDia';
import VerMenuDelDia from './pages/VerMenuDelDia';
import EditarMenuDelDia from './pages/EditarMenuDelDia';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminMenuPreview from './components/AdminMenuPreview';
import CrearMenuEspecialEmpresa from './pages/CrearMenuEspecialEmpresa';
import PerfilUsuario from './components/PerfilUsuario';

const App = () => (
  <Routes>
    {/* 👉 Landing visible al inicio */}
    <Route path="/" element={<LandingAuth />} />

    {/* 👉 Layout general con rutas internas */}
    <Route element={<Layout />}>
      <Route path="/app" element={<MainApp />} />
      <Route path="/quienes-somos" element={<QuienesSomos />} />
      <Route path="/perfil" element={<PerfilUsuario />} />
    </Route>

    {/* 👉 Login / Registro sin layout */}
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />

    {/* 👉 Admin Dashboard */}
    <Route path="/admin" element={<AdminHome />} />
    <Route path="/admin/editar-menu" element={<EditarMenu />} />
    <Route path="/admin/ver-pedidos" element={<AdminPedidos />} />
    <Route path="/admin/dashboard" element={<DashboardAdmin />} />
    <Route path="/admin/historial" element={<HistorialAdmin />} />
    <Route path="/admin/produccion" element={<ProduccionResumen />} />
    <Route path="/admin/editar-precios" element={<EditarPrecios />} />
    <Route path="/admin/crear-dia" element={<CrearMenuDelDia />} />
    <Route path="/admin/menu-del-dia" element={<VerMenuDelDia />} />
    <Route path="/admin/editar-menu-del-dia" element={<EditarMenuDelDia />} />
    <Route path="/admin/ver-menu" element={<AdminMenuPreview />} />
    <Route path="/admin/empresa/especial" element={<CrearMenuEspecialEmpresa />} />

    {/* 👉 Delivery Dashboard */}
    <Route path="/delivery" element={<DeliveryDashboard />} />
  </Routes>
);

export default App;
