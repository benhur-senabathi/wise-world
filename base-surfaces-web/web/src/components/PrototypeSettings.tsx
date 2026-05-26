import { useState, useEffect } from 'react';
import { Drawer, SelectInput, SelectInputOptionContent, SegmentedControl, Field, Input } from '@transferwise/components';

import { useTheme } from '@wise/components-theming';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, type Language } from '../context/Language';
import { currencyMeta } from '@shared/data/currency-rates';
import { Flag } from '@wise/art';

export function PrototypeSettings() {
  const { isScreenModeDark, setScreenMode } = useTheme();
  const { consumerName, setConsumerName, businessName, setBusinessName, consumerHomeCurrency, setConsumerHomeCurrency, businessHomeCurrency, setBusinessHomeCurrency } = usePrototypeNames();
  const { language, setLanguage, t } = useLanguage();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Listen for open-settings event from ScreenGallery
  useEffect(() => {
    const handler = () => setDrawerOpen(true);
    window.addEventListener('open-settings', handler);
    return () => window.removeEventListener('open-settings', handler);
  }, []);

  const currentValue = isScreenModeDark ? 'dark' : 'light';
  const [accountType, setAccountType] = useState('consumer');

  return (
    <>
      <Drawer
        open={drawerOpen}
        headerTitle={t('settings.title')}
        position="right"
        onClose={() => setDrawerOpen(false)}
      >
        <div style={{ overflowY: 'auto', flex: 1 }}>
        <p className="np-text-body" style={{ margin: '0 0 24px', color: 'var(--color-content-secondary)' }}>
          {t('settings.hideHint')}
        </p>
        <div style={{ padding: '24px 0' }}>
          <h3 className="np-text-title-body" style={{ margin: '0 0 16px' }}>{t('settings.visual')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="np-text-title-group" style={{ display: 'block', marginBottom: 8 }}>
                {t('settings.appearance')}
              </label>
              <SelectInput
                size="md"
                placeholder="Choose theme..."
                value={currentValue}
                onChange={(val) => {
                  if (val === 'light' || val === 'dark') {
                    setScreenMode(val);
                  }
                }}
                items={[
                  { type: 'option', value: 'light' },
                  { type: 'option', value: 'dark' },
                ]}
                renderValue={(val) => (
                  <SelectInputOptionContent title={val === 'light' ? t('settings.light') : t('settings.dark')} />
                )}
              />
            </div>
            <div>
              <label className="np-text-title-group" style={{ display: 'block', marginBottom: 8 }}>
                {t('settings.language')}
              </label>
              <SelectInput
                size="md"
                placeholder="Choose language..."
                value={language}
                onChange={(val) => setLanguage(val as Language)}
                items={[
                  { type: 'option', value: 'en' },
                  { type: 'option', value: 'es' },
                  { type: 'option', value: 'de' },
                  { type: 'option', value: 'fr' },
                ]}
                renderValue={(val) => (
                  <SelectInputOptionContent title={
                    { en: 'English', es: 'Español', de: 'Deutsch', fr: 'Français' }[val] ?? val
                  } />
                )}
              />
            </div>
          </div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-neutral)', margin: 0 }} />
        <div style={{ padding: '24px 0' }}>
          <h3 className="np-text-title-body" style={{ margin: '0 0 16px' }}>{t('settings.accounts')}</h3>
          <SegmentedControl
            name="account-type"
            value={accountType}
            mode="input"
            segments={[
              { id: 'consumer', label: t('settings.consumer'), value: 'consumer' },
              { id: 'business', label: t('settings.business'), value: 'business' },
            ]}
            onChange={setAccountType}
          />
          <div style={{ marginTop: 16, marginBottom: 0 }}>
            {accountType === 'consumer' ? (
              <Field label={t('settings.name')}>
                <Input
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                />
              </Field>
            ) : (
              <Field label={t('settings.name')}>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </Field>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <label className="np-text-title-group" style={{ display: 'block', marginBottom: 8 }}>
              {t('settings.homeCurrency')}
            </label>
            <SelectInput
              size="md"
              placeholder="Choose currency..."
              value={accountType === 'consumer' ? consumerHomeCurrency : businessHomeCurrency}
              onChange={(val) => accountType === 'consumer' ? setConsumerHomeCurrency(val as string) : setBusinessHomeCurrency(val as string)}
              items={Object.keys(currencyMeta).map((code) => ({
                type: 'option' as const,
                value: code,
              }))}
              renderValue={(val) => {
                const meta = currencyMeta[val];
                if (!meta) return <SelectInputOptionContent title={val} />;
                return (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Flag code={meta.code} intrinsicSize={20} />
                    <span>{meta.name} · {meta.code}</span>
                  </span>
                );
              }}
            />
          </div>
        </div>
        </div>
      </Drawer>
    </>
  );
}
