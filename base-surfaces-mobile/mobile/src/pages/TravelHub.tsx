import { Button, IconButton } from '@transferwise/components';
import { Search, ArrowRight } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { useLanguage } from '../context/Language';
import type { TranslationKey } from '../translations/en';
import './TravelHub.css';

const countries: { nameKey: TranslationKey; flagCode: string }[] = [
  { nameKey: 'travel.countrySpain' as TranslationKey, flagCode: 'ES' },
  { nameKey: 'travel.countryUS' as TranslationKey, flagCode: 'US' },
  { nameKey: 'travel.countryGermany' as TranslationKey, flagCode: 'DE' },
  { nameKey: 'travel.countryBrazil' as TranslationKey, flagCode: 'BR' },
  { nameKey: 'travel.countryJapan' as TranslationKey, flagCode: 'JP' },
];

export function TravelHub() {
  const { t } = useLanguage();

  return (
    <div className="travel">
      <h1 className="np-text-title-screen travel__title">{t('travel.title' as any)}</h1>

      <h2 className="np-text-title-subsection" style={{ margin: '16px 0 12px' }}>{t('travel.prepareTrip' as any)}</h2>

      <div className="travel__lounge">
        <img className="travel__lounge-bg" src="/lounge-bg.jpg" alt="" />
        <div className="travel__lounge-overlay" />
        <div className="travel__lounge-text">
          <span className="travel__lounge-heading">{t('travel.loungeTitle' as any)}</span>
        </div>
        <div className="travel__lounge-footer">
          <span className="travel__lounge-price np-text-body-large-bold">{t('travel.loungePrice' as any)}</span>
          <IconButton size={48} priority="primary" aria-label="View lounge access">
            <ArrowRight size={24} />
          </IconButton>
        </div>
      </div>

      <h2 className="np-text-title-subsection" style={{ margin: '24px 0 12px' }}>{t('travel.tipsTitle' as any)}</h2>
      <div className="travel__countries">
        <IconButton size={48} priority={"secondary-neutral" as any} aria-label="Search countries">
          <Search size={24} />
        </IconButton>
        {countries.map((c) => (
          <button key={c.flagCode} className="travel__country-chip" type="button">
            <span className="travel__country-flag">
              <Flag code={c.flagCode} loading="eager" />
            </span>
            <span className="np-text-body-default-bold">{t(c.nameKey)}</span>
          </button>
        ))}
      </div>

      <h2 className="np-text-title-subsection" style={{ margin: '24px 0 12px' }}>{t('travel.stampsTitle' as any)}</h2>
      <div className="travel__stamps">
        <img className="travel__stamps-img" src="/stamps-bg.png" alt="" />
        <div className="travel__stamps-cta">
          <Button v2 size="md" priority="primary">{t('travel.stampsCta' as any)}</Button>
        </div>
      </div>
    </div>
  );
}
