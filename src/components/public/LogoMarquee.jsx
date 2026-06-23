import './LogoMarquee.css';

// Logos reales desde src/assets/logos
import allianz      from '../../assets/logos/Allianz.jpg';
import blogo        from '../../assets/logos/Blogo.jpg';
import hidroplas    from '../../assets/logos/Hidroplas.jpg';
import acsa         from '../../assets/logos/acsa_mining.jpg';
import chitza       from '../../assets/logos/chitza.jpg';
import colegio      from '../../assets/logos/colegio_san_jorge.jpg';
import goldstein    from '../../assets/logos/goldstein.jpg';
import inap         from '../../assets/logos/inap.jpg';
import mendozaCiudad from '../../assets/logos/mendoza_ciudad.jpg';
import nav          from '../../assets/logos/nav.jpg';

const LOGOS = [
  { src: allianz,       alt: 'Allianz' },
  { src: blogo,         alt: 'Blogo' },
  { src: hidroplas,     alt: 'Hidroplas' },
  { src: acsa,          alt: 'ACSA Mining' },
  { src: chitza,        alt: 'Chitza' },
  { src: colegio,       alt: 'Colegio San Jorge' },
  { src: goldstein,     alt: 'Goldstein' },
  { src: inap,          alt: 'INAP' },
  { src: mendozaCiudad, alt: 'Municipalidad Mendoza' },
  { src: nav,           alt: 'NAV' },
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
              <img src={logo.src} alt={logo.alt} / decoding="async" loading="lazy">
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
