import { Link } from 'react-router-dom';
import '../../styles/public.css';
import './Comunidad.css';
import {
  IcoGift, IcoCalendar, IcoChat, IcoStar, IcoSmartphone, IcoComunidad
} from '../../components/public/icons';

const WA_GRUPO = 'https://wa.me/542614601788?text=Hola%2C%20quiero%20unirme%20a%20la%20comunidad%20de%20Eat%20%26%20Run.';

const BENEFITS = [
  { Icon: IcoGift,       title: 'Promociones exclusivas', desc: 'Descuentos y ofertas especiales solo para miembros de nuestra comunidad.' },
  { Icon: IcoCalendar,   title: 'Menú anticipado',        desc: 'Accedé al menú de la semana antes que nadie y planificá con tiempo.' },
  { Icon: IcoChat,       title: 'Atención personalizada', desc: 'Te asesoramos para que encuentres la mejor opción según tus objetivos.' },
  { Icon: IcoStar,       title: 'Novedades primero',      desc: 'Enterarte primero de nuevos productos, sabores y propuestas.' },
];

export default function Comunidad() {
  return (
    <div className="pub-page">

      {/* Hero */}
      <section className="page-hero">
        <img src="/fotos/comunidad.png" alt="Comunidad" className="page-hero__img" / decoding="async">
        <div className="page-hero__overlay" />
        <div className="page-hero__content">
          <span className="page-hero__tag">
            <IcoComunidad size={14} /> Comunidad
          </span>
          <h1 className="page-hero__title">Formá parte<br/>de algo más grande</h1>
          <p className="page-hero__sub">Beneficios exclusivos para los que eligen vivir mejor cada día.</p>
        </div>
      </section>

      {/* Beneficios */}
      <section className="pub-section">
        <p className="section-label">Para nuestra comunidad</p>
        <h2 className="section-title">Beneficios y promociones</h2>
        <p className="section-body">
          Contactanos y te ofrecemos una solución que mejor se adapte a tus necesidades.
          Como parte de nuestra comunidad, accedés a beneficios exclusivos y promociones especiales.
        </p>
        <div className="com-benefits">
          {BENEFITS.map((b, i) => (
            <div className="com-benefit" key={i}>
              <span className="com-benefit__icon"><b.Icon size={22} /></span>
              <div>
                <h3 className="com-benefit__title">{b.title}</h3>
                <p className="com-benefit__desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Unite */}
      <section style={{ background: '#f2faf0' }}>
        <div className="pub-section">
          <div className="grid-2">
            <div>
              <p className="section-label">
                <IcoSmartphone size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Unite a nosotros
              </p>
              <h2 className="section-title">Unite a nuestra comunidad</h2>
              <p className="section-body">
                Somos una comunidad de personas que eligieron priorizar su alimentación sin complicarse la vida.
                Sumarte es simple: escribinos por WhatsApp y te incorporamos al grupo.
              </p>
              <div style={{ marginTop: '32px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <a href={WA_GRUPO} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Unirme por WhatsApp
                </a>
                <Link to="/registro" className="btn-outline">Crear cuenta</Link>
              </div>
            </div>
            <div className="com-img-wrap">
              <img src="/assets/comunidad.png" alt="Comunidad eat & run" / decoding="async" loading="lazy">
            </div>
          </div>
        </div>
      </section>

      {/* CTA crear cuenta */}
      <section className="com-cta">
        <div className="com-cta__inner">
          <h2>¿Todavía no tenés cuenta?</h2>
          <p>Creá tu perfil gratis y empezá a elegir tus menús esta semana.</p>
          <Link to="/registro" className="btn-white">Crear cuenta gratis</Link>
        </div>
      </section>

    </div>
  );
}
