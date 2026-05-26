# Web Setup

## Provider Setup

Every app must wrap its root in `<Provider>` with i18n config:

```tsx
import { Provider } from '@transferwise/components';
import en from '@transferwise/components/build/i18n/en.json';

function Root() {
  return (
    <Provider i18n={{ locale: 'en-UK', messages: en }}>
      <App />
    </Provider>
  );
}
```

---

## CSS Import Order

Order matters — import in this sequence:

```css
/* 1. Neptune CSS reset and base styles */
@import '@transferwise/neptune-css/dist/css/neptune.css';

/* 2. Component styles */
@import '@transferwise/components/build/main.css';

/* 3. Design tokens (CSS custom properties) */
@import '@transferwise/neptune-tokens/tokens.css';
```

---

## Theming

Package: `@wise/components-theming` v1.10.1

Apply Wise brand theming (colors, fonts) to components:

```tsx
import '@wise/components-theming/wise.css';
```

For dark theme support, add the theme class to your root element or use the provided theme utilities.

---

## Vite Project Configuration

### vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prototype</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## npm Dependencies

### Production

```
react
react-dom
prop-types
@transferwise/components
@transferwise/neptune-tokens
@transferwise/neptune-css
@transferwise/icons
@wise/art
@transferwise/formatting
@transferwise/neptune-validation
@wise/components-theming
```

### Dev

```
vite
@vitejs/plugin-react
typescript
@types/react
@types/react-dom
```

---

## New Prototype Checklist

When starting a new prototype from the _template:

1. Copy `_template/` to `Prototypes/<project-name>/`
2. Update `<title>` in `index.html`
3. `npm install`
4. `npm run dev` — opens localhost:3000
5. Edit `src/App.tsx` to build your screens
