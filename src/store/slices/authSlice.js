// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';


// Obtener user desde localStorage
const getUserFromStorage = () => {
  try {
    const data = localStorage.getItem('eatAndRunUser');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Obtener token desde localStorage
const getTokenFromStorage = () => {
  try {
    return localStorage.getItem('authToken') || null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage()
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      const { user, token } = action.payload;

      if (user) {
        state.user = user;
        localStorage.setItem('eatAndRunUser', JSON.stringify(user));
      }

      if (token) {
        state.token = token;
        localStorage.setItem('authToken', token);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('eatAndRunUser');
      localStorage.removeItem('authToken');
    }
  }
});

export const { setUser, logout } = authSlice.actions;

export const loadFromStorage = () => (dispatch) => {
  const user = getUserFromStorage();
  const token = getTokenFromStorage();
  if (user && token) {
    dispatch(setUser({ user, token }));
  }
};

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;

export default authSlice.reducer;
