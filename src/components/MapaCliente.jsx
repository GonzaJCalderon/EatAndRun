import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { geocodeDireccion } from '../utils/geocode';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🧭 Fix para íconos de Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const MapaCliente = ({ direccion, nombre }) => {
  const [coordenadas, setCoordenadas] = useState(null);

  useEffect(() => {
    let cancelado = false;
    if (direccion) {
      geocodeDireccion(direccion).then(coords => {
        if (!cancelado) setCoordenadas(coords);
      });
    }
    return () => {
      cancelado = true;
    };
  }, [direccion]);

  if (!coordenadas) return <p>📍 Obteniendo mapa...</p>;

  return (
    <div style={{ height: '200px', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={[coordenadas.lat, coordenadas.lon]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordenadas.lat, coordenadas.lon]}>
          <Popup>
            🏠 {nombre}<br />📍 {direccion}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapaCliente;
