import { Outlet } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import ScrollToTop from '../../components/ScrollToTop';
import '../../styles/public.css';

export default function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </>
  );
}
