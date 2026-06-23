import '../../styles/public.css';
import './Contacto.css';
import { IcoWhatsApp, IcoInstagram, IcoMail, IcoContacto, IcoMapPin, IcoClock } from '../../components/public/icons';

const WA   = 'https://wa.me/542614601788';
const IG   = 'https://www.instagram.com/eatandrun.mza/';
const MAIL = 'mailto:eatandrun.mza@gmail.com';

const CHANNELS = [
  {
    Icon: IcoWhatsApp,
    label: 'WhatsApp',
    handle: '+54 261 460-1788',
    desc: 'Respondemos rápido. Ideal para consultas y pedidos.',
    link: WA,
    color: '#25d366',
    bg: 'rgba(37,211,102,0.08)',
    cta: 'Escribirnos',
  },
  {
    Icon: IcoInstagram,
    label: 'Instagram',
    handle: '@eatandrun.mza',
    desc: 'Seguinos para ver novedades, recetas y el menú de la semana.',
    link: IG,
    color: '#e1306c',
    bg: 'rgba(225,48,108,0.08)',
    cta: 'Ver perfil',
  },
  {
    Icon: IcoMail,
    label: 'Email',
    handle: 'eatandrun.mza@gmail.com',
    desc: 'Para consultas formales, cotizaciones y propuestas de empresa.',
    link: MAIL,
    color: '#4a7c42',
    bg: 'rgba(74,124,66,0.08)',
    cta: 'Enviar email',
  },
];

const SCHEDULE = [
  { day: 'Lunes a Viernes', time: '8:00 – 18:00 hs' },
  { day: 'Sábados',         time: '9:00 – 13:00 hs' },
  { day: 'Domingos',        time: 'Cerrado' },
];

export default function Contacto() {
  return (
    <div className="pub-page">

      {/* Hero */}
      <section className="page-hero">
        <img src="/fotos/Principal2.png" alt="Contacto" className="page-hero__img" />
        <div className="page-hero__overlay" />
        <div className="page-hero__content">
          <span className="page-hero__tag"><IcoContacto size={14} /> Contacto</span>
          <h1 className="page-hero__title">Hablemos</h1>
          <p className="page-hero__sub">Estamos disponibles para ayudarte por WhatsApp, Instagram o email.</p>
        </div>
      </section>

      {/* Canales */}
      <section className="pub-section">
        <p className="section-label" style={{ textAlign: 'center' }}>Elegí cómo contactarnos</p>
        <h2 className="section-title" style={{ textAlign: 'center' }}>Nuestros canales</h2>
        <div className="con-channels">
          {CHANNELS.map((c, i) => (
            <a
              href={c.link}
              target={c.link.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="con-channel"
              key={i}
              style={{ '--ch-color': c.color, '--ch-bg': c.bg }}
            >
              <div className="con-channel__icon"><c.Icon size={28} /></div>
              <div className="con-channel__body">
                <h3 className="con-channel__label">{c.label}</h3>
                <p className="con-channel__handle">{c.handle}</p>
                <p className="con-channel__desc">{c.desc}</p>
                <span className="con-channel__cta">{c.cta} →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Horarios */}
      <section style={{ background: '#f2faf0' }}>
        <div className="pub-section" style={{ textAlign: 'center' }}>
          <p className="section-label" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <IcoClock size={13} /> Horarios
          </p>
          <h2 className="section-title">Horarios de atención</h2>
          <div className="con-schedule">
            {SCHEDULE.map((s, i) => (
              <div className="con-schedule__item" key={i}>
                <span className="con-schedule__day">{s.day}</span>
                <span className="con-schedule__time">{s.time}</span>
              </div>
            ))}
          </div>
          <p style={{ color: '#5a6557', fontSize: '0.9rem', marginTop: '24px', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <IcoMapPin size={14} /> Mendoza, Argentina
          </p>
        </div>
      </section>

    </div>
  );
}
