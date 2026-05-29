import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from '@transferwise/components';
import { ThemeProvider } from '@wise/components-theming';
import en from '@transferwise/components/build/i18n/en.json';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme="personal" screenMode={window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}>
      <Provider i18n={{ locale: 'en-GB', messages: en }}>
        <App />
      </Provider>
    </ThemeProvider>
  </StrictMode>,
);
