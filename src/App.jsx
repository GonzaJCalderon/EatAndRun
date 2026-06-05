import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import LandingAuth from './pages/LandingAuth';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarClave from './pages/RecuperarClave';
import ResetPassword from './components/ResetPassword';
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
import EditarTartas from './pages/AdminTartas';

import AdminMenuPreview from './components/AdminMenuPreview';
import PerfilUsuario from './components/PerfilUsuario';
import MisPedidos from './components/MisPedidos';
import PedidoDetalle from './components/PedidoDetalle';

import EmpleadosEmpresa from './pages/EmpleadoEmpresa';
import AdminEmpresa from './pages/AdminEmpresa';
import AdminEmpresaDetalle from './pages/AdminEmpresaDetalle';
import EmpresasList from './pages/EmpresasList';
import CrearEmpleado from './components/CrearEmpleado';
import PedidosEmpresa from './pages/PedidosEmpresa';

import DeliveryDashboard from './pages/DeliveryDashboard';

import EmpresaOnlyRoute from './components/EmpresaOnlyRoute';

const App = () => (
  <Routes>

    {/* 🌐 Página pública */}
    <Route path="/" element={<LandingAuth />} />
    <Route path="/quienes-somos" element={<QuienesSomos />} />

    {/* 🔐 Login y registro */}
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/recuperar-clave" element={<RecuperarClave />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />

    {/* 🔄 Layout común */}
    <Route element={<Layout />}>
      <Route path="/app" element={<MainApp />} />
      <Route path="/perfil" element={<PerfilUsuario />} />
    </Route>

    {/* 🛠️ Panel Admin */}
    <Route path="/admin" element={<AdminHome />} />
    <Route path="/admin/dashboard" element={<DashboardAdmin />} />
    <Route path="/admin/ver-pedidos" element={<AdminPedidos />} />
    <Route path="/admin/editar-menu" element={<EditarMenu />} />
    <Route path="/admin/historial" element={<HistorialAdmin />} />
    <Route path="/admin/produccion" element={<ProduccionResumen />} />
    <Route path="/admin/editar-precios" element={<EditarPrecios />} />
    <Route path="/admin/menu-del-dia" element={<VerMenuDelDia />} />
    <Route path="/admin/crear-dia" element={<CrearMenuDelDia />} />
    <Route path="/admin/editar-platos" element={<EditarMenuDelDia />} />
    <Route path="/admin/editar-tartas" element={<EditarTartas />} />
    <Route path="/admin/ver-menu" element={<AdminMenuPreview />} />

    {/* 🏢 Empresas Admin */}
    <Route path="/admin/empresas" element={<EmpresasList />} /> {/* ✅ Lista de todas las empresas */}
    <Route path="/admin/empresa/:id" element={<AdminEmpresaDetalle />} /> 

    {/* 🧑‍💼 Empleados */}
    <Route path="/admin/empleados" element={<EmpleadosEmpresa />} /> {/* Admin ve empleados */}
    <Route path="/empresa/empleados" element={<EmpleadosEmpresa />} /> {/* Empresa ve sus empleados */}
    <Route path="/empresa/empleados/nuevo" element={<CrearEmpleado />} />

    {/* 🧾 Pedidos Empresa */}
    <Route path="/empresa/pedidos" element={<PedidosEmpresa />} />

    {/* 🏢 Panel empresa (solo su empresa logueada) */}
    <Route
      path="/admin/empresa"
      element={
        <EmpresaOnlyRoute>
          <AdminEmpresa />
        </EmpresaOnlyRoute>
      }
    />

    {/* 📦 Mis pedidos (usuario normal) */}
    <Route path="/mis-pedidos" element={<MisPedidos />} />
    <Route path="/mis-pedidos/:id" element={<PedidoDetalle />} />

    {/* 🚚 Delivery */}
    <Route path="/delivery" element={<DeliveryDashboard />} />
    
  </Routes>
);

export default App;
