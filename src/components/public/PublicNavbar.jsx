import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PublicNavbar.css';

const logo = '/assets/eatandrun-logo.jpg';

// SVG icons matching the owner's nav map style
const IcoMenus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="15" height="15">
    <path d="M12 2a5 5 0 0 0-5 5c0 2.4 2 6 5 9 3-3 5-6.6 5-9a5 5 0 0 0-5-5z"/>
    <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const IcoProductos = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="15" height="15">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m0 0h18M3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/>
    <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
  </svg>
);
const IcoEmpresas = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="15" height="15">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
  </svg>
);
const IcoNosotros = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="15" height="15">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoComunidad = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="15" height="15">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcoContacto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="15" height="15">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const NAV_LINKS = [
  { label: 'Menús',     path: '/menus',     Icon: IcoMenus },
  { label: 'Productos', path: '/productos', Icon: IcoProductos },
  { label: 'Empresas',  path: '/empresas',  Icon: IcoEmpresas },
  { label: 'Nosotros',  path: '/nosotros',  Icon: IcoNosotros },
  { label: 'Comunidad', path: '/comunidad', Icon: IcoComunidad },
  { label: 'Contacto',  path: '/contacto',  Icon: IcoContacto },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const location                = useLocation();
  const isHome                  = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const solid = !isHome || scrolled;

  return (
    <nav className={`pnav ${solid ? 'pnav--solid' : ''}`}>
      <div className="pnav__inner">
        <Link to="/" className="pnav__logo">
          <span className="pnav__logo-text">eat<b>&amp;</b>run</span>
        </Link>

        <ul className="pnav__links">
          {NAV_LINKS.map(({ label, path, Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`pnav__link ${location.pathname.startsWith(path) ? 'pnav__link--active' : ''}`}
              >
                <span className="pnav__link-icon"><Icon /></span>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link to="/login" className="pnav__cta">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Mi Cuenta
        </Link>

        <button
          className={`pnav__burger ${open ? 'open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Menú"
        >
          <span/><span/><span/>
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`pnav__drawer ${open ? 'open' : ''}`}>
        {NAV_LINKS.map(({ label, path, Icon }) => (
          <Link key={path} to={path} className="pnav__drawer-link">
            <span className="pnav__drawer-icon"><Icon /></span>
            {label}
          </Link>
        ))}
        <Link to="/login" className="pnav__drawer-cta">Mi Cuenta</Link>
      </div>
    </nav>
  );
}
