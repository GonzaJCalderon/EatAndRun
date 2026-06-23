import { Link } from 'react-router-dom';
import './PublicFooter.css';

const logo = '/assets/eatandrun-logo.jpg';
const WA = 'https://wa.me/542614601788';
const IG = 'https://www.instagram.com/eatandrun.mza/';
const MAIL = 'mailto:eatandrun.mza@gmail.com';

export default function PublicFooter() {
  return (
    <footer className="pfooter">
      <div className="pfooter__inner">

        {/* Brand */}
        <div className="pfooter__brand">
          <img />
          <span className="pfooter__name">eat<b>&amp;</b>run</span>
          <p className="pfooter__tagline">Tu alimentación semanal, resuelta.</p>
          <div className="pfooter__socials">
            <a href={WA} target="_blank" rel="noopener noreferrer" className="pfooter__social pfooter__social--wa" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.057 23.428l5.7-1.456A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.869 0-3.628-.5-5.148-1.375l-.369-.218-3.804.972.999-3.717-.242-.383A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </a>
            <a href={IG} target="_blank" rel="noopener noreferrer" className="pfooter__social pfooter__social--ig" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a href={MAIL} className="pfooter__social pfooter__social--mail" aria-label="Email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="2" y="4" width="20" height="16" rx="3"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="pfooter__col">
          <h4>Sitio</h4>
          <ul>
            <li><Link to="/menus">Menús Saludables</Link></li>
            <li><Link to="/productos">Productos</Link></li>
            <li><Link to="/empresas">Empresas</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
            <li><Link to="/comunidad">Comunidad</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="pfooter__col">
          <h4>Contacto</h4>
          <ul>
            <li><a href={WA} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href={IG} target="_blank" rel="noopener noreferrer">@eatandrun.mza</a></li>
            <li><a href={MAIL}>eatandrun.mza@gmail.com</a></li>
          </ul>
        </div>

        <div className="pfooter__col">
          <h4>Mi Cuenta</h4>
          <ul>
            <li><Link to="/login">Iniciar sesión</Link></li>
            <li><Link to="/registro">Crear cuenta</Link></li>
          </ul>
        </div>

      </div>
      <div className="pfooter__bottom">
        <p>© {new Date().getFullYear()} Eat &amp; Run · Mendoza, Argentina</p>
      </div>
    </footer>
  );
}
