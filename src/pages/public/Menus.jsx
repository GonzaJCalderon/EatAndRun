import { Link } from 'react-router-dom';
import '../../styles/public.css';
import './Menus.css';
import { IcoMenus, IcoSmartphone, IcoCheck, IcoTruck } from '../../components/public/icons';

const WA = 'https://wa.me/542614601788';

const STEPS = [
  {
    Icon: IcoSmartphone,
    num: '01',
    title: 'Elegí',
    img: '/fotos/elegi.png',
    desc: 'Creá tu perfil en nuestra plataforma. Seleccioná tus favoritos y armá tu planificación semanal en pocos minutos.',
  },
  {
    Icon: IcoCheck,
    num: '02',
    title: 'Confirmá',
    img: null,
    desc: 'Completá tu pedido desde la plataforma y dejá todo organizado para la semana. Nosotros nos encargamos del resto.',
  },
  {
    Icon: IcoTruck,
    num: '03',
    title: 'Recibí y disfrutá',
    img: '/fotos/entrega(4).png',
    desc: 'Preparamos tu pedido y lo entregamos el día acordado. Todo listo para disfrutar de menús equilibrados y prácticos.',
  },
];

export default function Menus() {
  return (
    <div className="pub-page menus-page">

      {/* Hero */}
      <section className="page-hero">
        <img src=" fotos/menus.png" alt="Menús Saludables" className="page-hero__img" / decoding="async" />
        <div className="page-hero__overlay" />
        <div className="page-hero__content">
          <span className="page-hero__tag"><IcoMenus size={14} /> Menús Saludables</span>
          <h1 className="page-hero__title">Más que menús.<br/>Una propuesta integral.</h1>
          <p className="page-hero__sub">Más de 30 opciones diarias para acompañar una alimentación consciente.</p>
        </div>
      </section>

      {/* Menú semanal */}
      <section className="pub-section">
        <div className="grid-2">
          <div>
            <p className="section-label">Menú semanal</p>
            <h2 className="section-title">Planificá tu semana</h2>
            <p className="section-body">
              Más que menús. Una propuesta integral con más de 30 opciones diarias.
              Además de nuestros menús saludables, incorporamos productos seleccionados
              para acompañar una alimentación consciente.
            </p>
            <div style={{ marginTop: '32px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/registro" className="btn-primary">Empezar ahora</Link>
              <Link to="/login" className="btn-outline">Ver mi menú</Link>
            </div>
          </div>
          <div className="menus-img-wrap">
            <img src=" fotos/disfruta.png" alt="Menú semanal" / decoding="async" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ background: '#f2faf0' }}>
        <div className="pub-section">
          <p className="section-label">Simple y rápido</p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>¿Cómo funciona?</h2>
          <div className="menus-steps">
            {STEPS.map((s, i) => (
              <div className="menus-step" key={i}>
                {s.img ? (
                  <div className="menus-step__img-wrap">
                    <img src={s.img} alt={s.title}  decoding="async" loading="lazy" />
                  </div>
                ) : (
                  <div className="menus-step__icon-wrap">
                    <span className="menus-step__icon-svg"><s.Icon size={56} /></span>
                  </div>
                )}
                <div className="menus-step__body">
                  <span className="menus-step__num">{s.num}</span>
                  <h3 className="menus-step__title">
                    <span className="menus-step__title-icon"><s.Icon size={18} /></span>
                    {s.title}
                  </h3>
                  <p className="menus-step__desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="menus-cta">
        <div className="menus-cta__inner">
          <h2>¿Querés conocer el menú de esta semana?</h2>
          <p>Iniciá sesión o creá tu cuenta para ver las opciones disponibles.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/registro" className="btn-white">Crear cuenta gratis</Link>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
