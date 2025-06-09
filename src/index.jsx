console.log('%c👉 Entrando a index.jsx', 'color: limegreen; font-size: 20px');

import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // ✅ Tu archivo custom
import { SnackbarProvider } from 'notistack';


import App from './App';
import { store, persistor } from './store/store';

const root = createRoot(document.getElementById('root'));


root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Router>
              <App />
            </Router>
          </PersistGate>
        </Provider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
