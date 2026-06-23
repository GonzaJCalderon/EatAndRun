import '../../styles/public.css';
import './Nosotros.css';
import { IcoNosotros, IcoChef, IcoTruck, IcoHeadset } from '../../components/public/icons';

const IcoBook = ({ size = 28 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IcoLeafPhilo = ({ size = 28 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M17 8C8 10 5.9 16.17 3.82 19.49c-.96 1.31.71 2.71 1.8 1.56 5-5.34 10.21-5.55 15.18-3.05 1.2.6 2.2-.8 1.4-1.8C19.92 13.08 18.5 7.5 17 8z"/>
  </svg>
);

const TEAM = [
  { Icon: IcoChef,    role: 'Cocina',    desc: 'Preparación diaria con ingredientes frescos y seleccionados.' },
  { Icon: IcoTruck,   role: 'Delivery',  desc: 'Entrega puntual para que disfrutes tu menú en el mejor momento.' },
  { Icon: IcoHeadset, role: 'Atención',  desc: 'Siempre disponibles para ayudarte a elegir lo mejor para vos.' },
];

export default function Nosotros() {
  return (
    <div className="pub-page">

      {/* Hero */}
      <section className="page-hero">
        <img />
        <div className="page-hero__overlay" />
        <div className="page-hero__content">
          <span className="page-hero__tag"><IcoNosotros size={14} /> Nosotros</span>
          <h1 className="page-hero__title">Quiénes somos</h1>
          <p className="page-hero__sub">Nacimos en Mendoza con una misión: hacer que comer sano sea fácil, rico y accesible.</p>
        </div>
      </section>

      {/* Historia */}
      <section className="pub-section">
        <div className="grid-2">
          <div>
            <h2 className="section-title nos-label-icon" style={{ marginBottom: '24px' }}>
              <IcoBook size={28} /> Nuestra historia
            </h2>
            <p className="section-body">
              Eat &amp; Run nació en 2019 con una idea simple: hacer que comer bien sea más fácil.
            </p>
            <p className="section-body" style={{ marginTop: '16px' }}>
              Desde entonces, trabajamos para acompañar a personas con distintos estilos de vida que buscan organizar su
              alimentación sin resignar sabor, calidad ni tiempo. Ya sea para quienes entrenan, trabajan, estudian o simplemente
              quieren incorporar mejores hábitos, desarrollamos soluciones prácticas pensadas para el día a día.
            </p>
            <p className="section-body" style={{ marginTop: '16px' }}>
              Nuestros menús son elaborados con ingredientes frescos y planificados junto a profesionales de la nutrición,
              combinando equilibrio, variedad y practicidad en cada propuesta.
            </p>
          </div>
          <div className="nos-img-wrap">
            <img />
          </div>
        </div>
      </section>

      {/* Filosofía */}
      <section style={{ background: '#f2faf0' }}>
        <div className="pub-section">
          <div className="grid-2 grid-2--reverse">
            <div>
              <p className="section-label nos-label-icon">
                <IcoLeafPhilo size={14} /> Nuestra filosofía
              </p>
              <h2 className="section-title">Si no lo estás cambiando, lo estás eligiendo.</h2>
              <p className="section-body">
                Creemos que una mejor alimentación no debería ser complicada. Por eso, en Eat &amp; Run creamos una propuesta que
                combina nutrición, practicidad y sabor, para que puedas alimentarte mejor sin dedicar tiempo a planificar, cocinar o
                hacer compras.
              </p>
              <p className="section-body" style={{ marginTop: '16px' }}>
                Cada menú está pensado para ayudarte a sostener hábitos saludables de manera simple y realista.
              </p>
            </div>
            <div className="nos-img-wrap">
              <img />
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="pub-section">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="section-label">Las personas detrás</p>
          <h2 className="section-title">Nuestro equipo</h2>
          <p className="section-body" style={{ margin: '0 auto' }}>
            Un equipo comprometido con tu bienestar y con la calidad de cada plato.
          </p>
        </div>
        <div className="nos-team">
          {TEAM.map((m, i) => (
            <div className="nos-team-card" key={i}>
              <span className="nos-team-card__icon"><m.Icon size={32} /></span>
              <h3 className="nos-team-card__role">{m.role}</h3>
              <p className="nos-team-card__desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
