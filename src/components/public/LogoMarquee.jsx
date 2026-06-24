import './LogoMarquee.css';

// Logos reales desde src/assets/logos
import chitza from '../../assets/logos/CHITZA.png';
import ecolodge from '../../assets/logos/ECOLODGE.jpeg';
import ipc from '../../assets/logos/IPC.png';
import knauf from '../../assets/logos/Knauf.png';
import royalEnfield from '../../assets/logos/LOGO Royal Enfield.jpg';
import sanJorge from '../../assets/logos/San Jorge.jpg';
import triunfo from '../../assets/logos/TRIUNFO.jpg';
import acerosCuyanos from '../../assets/logos/aceroscuyanos_sa_logo.jpeg';
import edemsa from '../../assets/logos/edemsa_logo.jpeg';
import mendozaCiudad from '../../assets/logos/logociudaddemendoza.png';

const LOGOS = [
  { src: chitza,        alt: 'Chitza' },
  { src: ecolodge,      alt: 'Ecolodge' },
  { src: ipc,           alt: 'IPC' },
  { src: knauf,         alt: 'Knauf' },
  { src: royalEnfield,  alt: 'Royal Enfield' },
  { src: sanJorge,      alt: 'San Jorge' },
  { src: triunfo,       alt: 'Triunfo' },
  { src: acerosCuyanos, alt: 'Aceros Cuyanos' },
  { src: edemsa,        alt: 'Edemsa' },
  { src: mendozaCiudad, alt: 'Ciudad de Mendoza' },
];

export default function LogoMarquee() {
  // Duplicamos el array para lograr el efecto infinito sin corte
  const track = [...LOGOS, ...LOGOS];

  return (
    <section className="lmarquee">
      <p className="lmarquee__label">CONFÍAN EN NOSOTROS</p>
      <div className="lmarquee__track-wrap">
        <div className="lmarquee__track">
          {track.map((logo, i) => (
            <div className="lmarquee__item" key={i}>
              <img src={logo.src} alt={logo.alt}  decoding="async" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
