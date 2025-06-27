import { Outlet } from 'react-router-dom';
import Header from './Header';
import WhatsAppButton from './WhatsAppButton'; // 👈 Importá tu botón

const Layout = () => (
  <>
    <Header />
    <Outlet />
    <WhatsAppButton /> {/* 👈 Siempre visible en todas las páginas */}
  </>
);

export default Layout;
