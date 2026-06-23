import '../../styles/public.css';
import './Empresas.css';
import LogoMarquee from '../../components/public/LogoMarquee';
import { IcoEmpresas } from '../../components/public/icons';

const WA_LINK  = 'https://wa.me/542614601788';
const WA_COTI  = 'https://wa.me/542614601788?text=Hola%2C%20quisiera%20solicitar%20una%20cotizaci%C3%B3n%20de%20men%C3%BAs%20corporativos.';
const WA_EVENT = 'https://wa.me/542614601788?text=Hola%2C%20quisiera%20consultar%20sobre%20sandwiches%20para%20eventos.';

export default function Empresas() {
  return (
    <div className="pub-page">

      {/* Hero */}
      <section className="page-hero">
        <img src=" fotos/empresas2.png" alt="Empresas" className="page-hero__img" / decoding="async" />
        <div className="page-hero__overlay" />
        <div className="page-hero__content">
          <span className="page-hero__tag"><IcoEmpresas size={14} /> Empresas</span>
          <h1 className="page-hero__title">Gastronomía para<br/>tu empresa</h1>
          <p className="page-hero__sub">Menús corporativos y soluciones para eventos en Mendoza.</p>
        </div>
      </section>

      {/* Menús corporativos */}
      <section className="pub-section">
        <div className="grid-2">
          <div>
            <h2 className="section-title">Menús corporativos</h2>
            <p className="section-body">
              Viandas ejecutivas y planes de alimentación saludables diseñados a la medida de tu equipo de trabajo.
            </p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginTop: '16px' }}>
              Hacé click acá para conocer más
            </a>
          </div>
          <div className="emp-img-wrap">
            <img src=" fotos/Principal2.png" alt="Menús corporativos" / decoding="async" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Sandwiches */}
      <section style={{ background: '#f2faf0' }}>
        <div className="pub-section">
          <div className="grid-2 grid-2--reverse">
            <div>
              <h2 className="section-title">Sandwiches para eventos</h2>
              <p className="section-body">
                Bandejas surtidas con opciones artesanales y de calidad, ideales para acompañar reuniones y capacitaciones.
              </p>
              <a href={WA_EVENT} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginTop: '16px' }}>
                Contactanos para más detalles
              </a>
            </div>
            <div className="emp-img-wrap">
              <img src=" fotos/disfruta.png" alt="Sandwiches para eventos" / decoding="async" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Empresas que nos eligen */}
      <section className="pub-section" style={{ paddingBottom: '24px' }}>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Empresas que nos eligen</h2>
        <p className="section-body" style={{ textAlign: 'center', margin: '0 auto' }}>
          Acompañamos el día a día de múltiples instituciones y empresas mendocinas con nuestra gastronomía.
        </p>
      </section>
      
      {/* Galería animada */}
      <LogoMarquee />

      {/* CTA cotización */}
      <section className="emp-cta">
        <div className="emp-cta__inner">
          <a href={WA_COTI} target="_blank" rel="noopener noreferrer" className="btn-white">
            Solicitar cotización
          </a>
        </div>
      </section>

    </div>
  );
}
