// store/slices/galeriaSlice.js
import { createSlice } from '@reduxjs/toolkit';

const galeriaSlice = createSlice({
  name: 'galeria',
  initialState: {
    platos: {} // key: idPlato, value: { nombre, descripcion, img }
  },
  reducers: {
    setGaleria(state, action) {
      const nuevos = action.payload;
      nuevos.forEach((plato) => {
        state.platos[plato.id] = {
          nombre: plato.nombre,
          descripcion: plato.descripcion,
          img: plato.img
        };
      });
    }
  }
});

export const { setGaleria } = galeriaSlice.actions;
export const selectGaleria = (state) => state.galeria.platos;
export default galeriaSlice.reducer;
