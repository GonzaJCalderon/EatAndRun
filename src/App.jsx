import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RutaPrivada from './routes/RutaPrivada';
import RutaSoloAdmin from './components/RutaSoloAdmin';
import RutaAdminOModerador from './components/RutaAdminModerador';

import LandingAuth from './pages/LandingAuth';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarClave from './pages/RecuperarClave';
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
import EditarPedido from './components/EditarPedido';
import PedidoDetalle from './components/PedidoDetalle';

import EmpleadosEmpresa from './pages/EmpleadoEmpresa';
import AdminEmpresa from './pages/AdminEmpresa';
import AdminEmpresaDetalle from './pages/AdminEmpresaDetalle';
import EmpresasList from './pages/EmpresasList';
import CrearEmpleado from './components/CrearEmpleado';
import PedidosEmpresa from './pages/PedidosEmpresa';

import DeliveryDashboard from './pages/DeliveryDashboard';

import EmpresaOnlyRoute from './components/EmpresaOnlyRoute';
import Unauthorized from './pages/Unauthorized';

const App = () => (
  <Routes>

    {/* 🌐 Rutas públicas */}
    <Route path="/" element={<LandingAuth />} />
    <Route path="/quienes-somos" element={<QuienesSomos />} />
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/recuperar-clave" element={<RecuperarClave />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* 🔐 Rutas privadas protegidas por login */}
    <Route element={<RutaPrivada />}>

      {/* 🌐 Layout general con barra y navegación */}
      <Route element={<Layout />}>

        {/* ✅ Rutas disponibles para todos los logueados */}
        <Route path="/app" element={<MainApp />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/mis-pedidos/:id" element={<PedidoDetalle />} />
        <Route path="/editar-pedido/:id" element={<EditarPedido />} />

        {/* 🛠️ Panel ADMIN (solo admin) */}
        <Route path="/admin" element={<RutaAdminOModerador><AdminHome /></RutaAdminOModerador>} />
        <Route path="/admin/dashboard" element={<RutaAdminOModerador><DashboardAdmin /></RutaAdminOModerador>} />
        <Route path="/admin/ver-pedidos" element={<RutaSoloAdmin><AdminPedidos /></RutaSoloAdmin>} />
        <Route path="/admin/editar-menu" element={<RutaSoloAdmin><EditarMenu /></RutaSoloAdmin>} />
        <Route path="/admin/historial" element={<RutaSoloAdmin><HistorialAdmin /></RutaSoloAdmin>} />
        <Route path="/admin/editar-precios" element={<RutaSoloAdmin><EditarPrecios /></RutaSoloAdmin>} />
        <Route path="/admin/menu-del-dia" element={<RutaSoloAdmin><VerMenuDelDia /></RutaSoloAdmin>} />
        <Route path="/admin/crear-dia" element={<RutaSoloAdmin><CrearMenuDelDia /></RutaSoloAdmin>} />
        <Route path="/admin/editar-platos" element={<RutaSoloAdmin><EditarMenuDelDia /></RutaSoloAdmin>} />
        <Route path="/admin/editar-tartas" element={<RutaSoloAdmin><EditarTartas /></RutaSoloAdmin>} />
        <Route path="/admin/ver-menu" element={<RutaSoloAdmin><AdminMenuPreview /></RutaSoloAdmin>} />
        <Route path="/admin/empresas" element={<RutaSoloAdmin><EmpresasList /></RutaSoloAdmin>} />
        <Route path="/admin/empresa/:id" element={<RutaSoloAdmin><AdminEmpresaDetalle /></RutaSoloAdmin>} />
        <Route path="/admin/empleados" element={<RutaSoloAdmin><EmpleadosEmpresa /></RutaSoloAdmin>} />
        <Route path="/admin/empresa" element={<RutaSoloAdmin><AdminEmpresa /></RutaSoloAdmin>} />

        {/* 🛠️ Producción (admin + moderador) */}
        <Route path="/admin/produccion" element={<RutaAdminOModerador><ProduccionResumen /></RutaAdminOModerador>} />

        {/* 🧑‍💼 Empleados de empresa */}
        <Route path="/empresa/empleados" element={<EmpleadosEmpresa />} />
        <Route path="/empresa/empleados/nuevo" element={<CrearEmpleado />} />

        {/* 🧾 Pedidos Empresa */}
        <Route path="/empresa/pedidos" element={<PedidosEmpresa />} />

        {/* 🚚 Dashboard Delivery */}
        <Route path="/delivery" element={<DeliveryDashboard />} />

      </Route>
    </Route>

    {/* 🧭 Redirección si no existe ruta */}
    <Route path="*" element={<Navigate to="/login" replace />} />

  </Routes>
);

export default App;
