export const geocodeDireccion = async (direccion) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error('❌ Error al geocodificar:', err);
    return null;
  }
};
