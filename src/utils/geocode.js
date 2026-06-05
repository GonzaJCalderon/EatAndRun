export const geocodeDireccion = async (direccion) => {
  if (!direccion || direccion.trim() === '') return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'EatAndRunApp/1.0 (gonza@example.com)' // Cambiá por tu mail real
      }
    });

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
