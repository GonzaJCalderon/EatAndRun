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
import { GlobalStyles } from '@mui/material';



import App from './App';
import { store, persistor } from './store/store';

const root = createRoot(document.getElementById('root'));


root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
  <GlobalStyles styles={{
    '@media print': {
      '.no-print': {
        display: 'none !important'
      },
      body: {
        WebkitPrintColorAdjust: 'exact !important',
        printColorAdjust: 'exact !important',
        fontFamily: '"Poppins", sans-serif !important'
      },
      '@page': {
        margin: '1.5cm',
        size: 'A4 portrait'
      },
      header: {
        display: 'block',
        position: 'fixed',
        top: 0,
        width: '100%',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        padding: '6px 0',
        borderBottom: '1px solid #000',
        background: '#fff'
      },
      footer: {
        display: 'block',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
        fontSize: '10px',
        padding: '4px 0',
        borderTop: '1px solid #000',
        background: '#fff'
      },
      '.MuiCard-root': {
        pageBreakInside: 'avoid'
      }
    }
  }} />
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
