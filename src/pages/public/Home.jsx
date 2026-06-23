import { Link } from 'react-router-dom';
import '../../styles/public.css';
import './Home.css';
import { IcoStar } from '../../components/public/icons';

const WA = 'https://wa.me/542614601788';

// SVG icons matching the owner's navigation map
const IcoMenus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path d="M12 2a5 5 0 0 0-5 5c0 2.4 2 6 5 9 3-3 5-6.6 5-9a5 5 0 0 0-5-5z"/>
    <circle cx="12" cy="7" r="1.8" fill="currentColor" stroke="none"/>
  </svg>
);
const IcoProductos = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path d="M6 2l1.5 4.5h9L18 2"/>
    <rect x="3" y="6.5" width="18" height="15" rx="2"/>
    <path d="M12 10v7M8.5 13.5h7"/>
  </svg>
);
const IcoEmpresas = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="8" y1="14" x2="16" y2="14"/>
  </svg>
);
const IcoNosotros = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoComunidad = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcoContacto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const SECTIONS = [
  {
    Icon: IcoMenus,
    title: 'Menús Saludables',
    tag: 'Lo más elegido',
    desc: 'Más de 30 opciones diarias. Planificá tu semana en minutos.',
    path: '/menus',
    featured: true,
    img: '/fotos/menus.webp',
  },
  {
    Icon: IcoProductos,
    title: 'Productos',
    desc: 'Granola, aceite de oliva, frutos secos y snacks naturales.',
    path: '/productos',
    accent: '#a67c00',
    bg: '#fef9e7',
  },
  {
    Icon: IcoEmpresas,
    title: 'Empresas',
    desc: 'Menús corporativos y catering para tu equipo.',
    path: '/empresas',
    accent: '#2a6a8a',
    bg: '#e8f4fb',
  },
  {
    Icon: IcoNosotros,
    title: 'Nosotros',
    desc: 'Nuestra historia, filosofía y equipo.',
    path: '/nosotros',
    accent: '#7a3a8a',
    bg: '#f5eefb',
  },
  {
    Icon: IcoComunidad,
    title: 'Comunidad',
    desc: 'Beneficios y promociones exclusivas.',
    path: '/comunidad',
    accent: '#8a3a3a',
    bg: '#fbeeee',
  },
  {
    Icon: IcoContacto,
    title: 'Contacto',
    desc: 'WhatsApp · Instagram · Email',
    path: '/contacto',
    accent: '#3a5a8a',
    bg: '#eef2fb',
  },
];

export default function Home() {
  const [featured, ...rest] = SECTIONS;

  return (
    <div className="pub-page home">

      {/* ── Hero ── */}
      <section className="home-hero">
        <img 
          src="/fotos/sin-frase.webp" 
          alt="Eat & Run — alimentación semanal" 
          className="home-hero__bg" 
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="home-hero__overlay" />
        <div className="home-hero__content">
          <h2 className="home-hero__badge" style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>
            🌱 Viandas y comida saludable en Mendoza
          </h2>
          <h1 className="home-hero__title">
            Tu alimentación<br />
            <em>semanal, resuelta.</em>
          </h1>
          <p className="home-hero__sub">
            Menús semanales listos para disfrutar donde estés.
          </p>
          <p className="home-hero__quote">
            "Si no lo estás cambiando, lo estás eligiendo."
          </p>
          <div className="home-hero__btns">
            <Link to="/menus" className="btn-primary">Ver Menús</Link>
            <Link to="/registro" className="btn-white">Crear cuenta</Link>
          </div>
        </div>
        <div className="home-hero__mouse"><span /></div>
      </section>

      {/* ── Secciones — layout editorial ── */}
      <section className="home-editorial">
        <div className="home-editorial__inner">
          <header className="home-editorial__header">
            <span className="section-label">Explorá</span>
            <h2 className="section-title">Todo lo que hacemos</h2>
          </header>

          <div className="home-editorial__grid">

            {/* Card destacada — Menús */}
            <Link to={featured.path} className="home-feat">
              <img src={featured.img} alt={featured.title} className="home-feat__img" loading="lazy" / decoding="async">
              <div className="home-feat__overlay" />
              <div className="home-feat__body">
                <span className="home-feat__tag">{featured.tag}</span>
                <div className="home-feat__icon"><featured.Icon /></div>
                <h3 className="home-feat__title">{featured.title}</h3>
                <p className="home-feat__desc">{featured.desc}</p>
                <span className="home-feat__cta">Ver menús →</span>
              </div>
            </Link>

            {/* Columna de cards pequeñas */}
            <div className="home-cards-col">
              {rest.map((s) => (
                <Link to={s.path} key={s.path} className="home-card-sm" style={{ '--bg': s.bg, '--accent': s.accent }}>
                  <span className="home-card-sm__icon"><s.Icon /></span>
                  <div className="home-card-sm__body">
                    <h3 className="home-card-sm__title">{s.title}</h3>
                    <p className="home-card-sm__desc">{s.desc}</p>
                  </div>
                  <span className="home-card-sm__arrow">→</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="home-testi">
        <div className="home-testi__inner">
          <span className="section-label">Lo que dicen</span>
          <h2 className="section-title">Testimonios</h2>
          <div className="home-testi__list">
            {[
              { name: 'María G.', txt: 'Comer sano nunca fue tan fácil. Los menús están buenísimos y la entrega siempre puntual.' },
              { name: 'Lucas P.', txt: 'Lo mejor que le pasó a mi semana. Me olvidé de tener que pensar qué cocinar.' },
              { name: 'Sofía R.', txt: 'Calidad increíble. La granola es deliciosa y los menús están siempre frescos.' },
            ].map((t, i) => (
              <figure className="testi-card" key={i}>
                <blockquote className="testi-card__txt">"{t.txt}"</blockquote>
                <figcaption className="testi-card__name">
                  <span style={{ color: '#ebb424', display: 'flex', gap: '2px', alignItems: 'center', marginBottom: '4px' }}>
                    <IcoStar size={14} /><IcoStar size={14} /><IcoStar size={14} /><IcoStar size={14} /><IcoStar size={14} />
                  </span>
                  — {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="home-cta">
        <div className="home-cta__inner">
          <h2>¿Empezamos esta semana?</h2>
          <p>Sumate a la comunidad eat&amp;run y transformá tu alimentación.</p>
          <div className="home-cta__btns">
            <Link to="/registro" className="btn-white">Crear cuenta gratis</Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-outline home-cta__wa">
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
