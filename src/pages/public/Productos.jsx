import '../../styles/public.css';
import './Productos.css';
import { IcoProductos, IcoLeaf, IcoBox, IcoGranola } from '../../components/public/icons';

// Tag icons per product
const IcoOlive = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M12 22V12M12 12C12 7 7 4 3 6M12 12C12 7 17 4 21 6"/>
    <path d="M3 6c4 0 7 3 9 6M21 6c-4 0-7 3-9 6"/>
  </svg>
);
const IcoNut = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"/>
    <path d="M12 6v6l4 2"/>
    <path d="M8 2c0 3 2 4 4 4s4-1 4-4"/>
  </svg>
);

const PRODUCTS = [
  { img: '/fotos/oliva.png',              name: 'Aceite de Oliva',   desc: 'Aceite de oliva extra virgen de primera extracción en frío. Calidad premium.',              tag: 'Condimento',   TagIcon: IcoOlive },
  { img: '/fotos/granola.png',            name: 'Snack',             desc: 'Granola artesanal con semillas, avena y frutos secos. Ideal para el desayuno o colación.', tag: 'Desayuno',     TagIcon: IcoGranola },
  { img: '/fotos/fs.png',                 name: 'Frutos Secos',      desc: 'Mix de frutos secos naturales y sin sal. La colación perfecta para tu jornada.',           tag: 'Snack',        TagIcon: IcoNut },
  { img: '/fotos/habitos saludables.png', name: 'Snacks Saludables', desc: 'Opciones naturales y nutritivas para acompañar tu día con energía.',                        tag: 'Snack',        TagIcon: IcoLeaf },
  { img: null,                            name: 'Nuevos Productos',  desc: 'Estamos trabajando en nuevas opciones para completar tu despensa saludable.',               tag: 'Próximamente', TagIcon: IcoBox, soon: true },
];

export default function Productos() {
  return (
    <div className="pub-page">

      {/* Hero */}
      <section className="page-hero">
        <img src="/fotos/granola.png" alt="Productos" className="page-hero__img" decoding="async" />
        <div className="page-hero__overlay" />
        <div className="page-hero__content">
          <span className="page-hero__tag"><IcoProductos size={14} /> Productos</span>
          <h1 className="page-hero__title">Productos<br/>seleccionados</h1>
          <p className="page-hero__sub">Complementá tu alimentación con productos naturales y de calidad.</p>
        </div>
      </section>

      {/* Grid */}
      <section className="pub-section">
        <p className="section-label">Lo que tenemos</p>
        <h2 className="section-title">Nuestros productos</h2>
        <div className="prod-grid">
          {PRODUCTS.map((p, i) => (
            <div className={`prod-card ${p.soon ? 'prod-card--soon' : ''}`} key={i}>
              {p.img ? (
                <div className="prod-card__img">
                  <img src={p.img} alt={p.name}  decoding="async" loading="lazy" />
                </div>
              ) : (
                <div className="prod-card__img prod-card__img--empty">
                  <IcoBox size={48} />
                </div>
              )}
              <div className="prod-card__body">
                <span className="prod-card__tag">
                  <p.TagIcon size={12} />
                  {p.tag}
                </span>
                <h3 className="prod-card__name">{p.name}</h3>
                <p className="prod-card__desc">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section style={{ background: '#f2faf0' }}>
        <div className="pub-section" style={{ textAlign: 'center' }}>
          <h2 className="section-title">¿Querés saber los precios o disponibilidad?</h2>
          <p className="section-body" style={{ margin: '0 auto 32px' }}>
            Consultanos por WhatsApp y te respondemos enseguida.
          </p>
          <a href="https://wa.me/542614601788" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Consultar por WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}
