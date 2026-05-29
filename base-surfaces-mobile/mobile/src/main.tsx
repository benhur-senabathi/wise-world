import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from '@transferwise/components';
import { ThemeProvider } from '@wise/components-theming';
import en from '@transferwise/components/build/i18n/en.json';
import './styles/global.css';
import './styles/standalone.css';
import App from './App';
import { DeviceFrame, DEVICE_CSS, isAppMode } from './DeviceFrame';

// Inject device frame styles (only needed for the outer frame page)
if (!isAppMode()) {
  const styleEl = document.createElement('style');
  styleEl.textContent = DEVICE_CSS;
  document.head.appendChild(styleEl);
  // Mark as standalone so CSS can target the mobile breakpoint without affecting iframe views
  document.documentElement.classList.add('standalone');
}

// In app mode (iframe), notify parent when dark mode changes so the status bar can update
if (isAppMode() && window.parent !== window) {
  const observer = new MutationObserver(() => {
    const isDark = document.documentElement.className.includes('dark');
    window.parent.postMessage({ type: 'theme-change', dark: isDark }, '*');
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

// Dynamic theme-color for PWA status bar (light/dark)
if (!isAppMode()) {
  const updateThemeColor = () => {
    const isDark = document.documentElement.className.includes('dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#121511' : '#ffffff');
  };
  const themeObserver = new MutationObserver(updateThemeColor);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Lock to portrait on supported browsers
  (screen.orientation as any)?.lock?.('portrait-primary').catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme="personal" screenMode={window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}>
      <Provider i18n={{ locale: 'en-GB', messages: en }}>
        <DeviceFrame>
          <App />
        </DeviceFrame>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
);
