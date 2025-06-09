import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selecciones: {},
  observaciones: '',
  extras: '',
  metodoPago: '',
  comprobante: null
};

const pedidoSlice = createSlice({
  name: 'pedido',
  initialState,
  reducers: {
    seleccionarPlato(state, action) {
      const { dia, platos } = action.payload;
      state.selecciones[dia] = platos;
    },
    setObservaciones(state, action) {
      state.observaciones = action.payload;
    },
    setExtras(state, action) {
      state.extras = action.payload;
    },
    setMetodoPago(state, action) {
      state.metodoPago = action.payload;
    },
    setComprobante(state, action) {
      state.comprobante = action.payload;
    },
    resetPedido(state) {
      state.selecciones = {};
      state.observaciones = '';
      state.extras = '';
      state.metodoPago = '';
      state.comprobante = null;
    }
  }
});

export const {
  seleccionarPlato,
  setObservaciones,
  setExtras,
  setMetodoPago,
  setComprobante,
  resetPedido
} = pedidoSlice.actions;

export default pedidoSlice.reducer;
