import { useState } from 'react';
import { ListItem, SelectInput, Button } from '@transferwise/components';
import { Lightning, Coins, Bank, ArrowRight } from '@transferwise/icons';
import { Flag } from '@wise/art';
import type { AccountType } from '@shared/data/account-registry';
import { useLanguage } from '../context/Language';
import './TravelHub.css';

const destinationItems = [
  { type: 'option' as const, value: 'ES', filterMatchers: ['Spain'] },
  { type: 'option' as const, value: 'US', filterMatchers: ['United States', 'USA', 'America'] },
  { type: 'option' as const, value: 'DE', filterMatchers: ['Germany'] },
  { type: 'option' as const, value: 'FR', filterMatchers: ['France'] },
  { type: 'option' as const, value: 'IT', filterMatchers: ['Italy'] },
  { type: 'option' as const, value: 'PT', filterMatchers: ['Portugal'] },
  { type: 'option' as const, value: 'JP', filterMatchers: ['Japan'] },
  { type: 'option' as const, value: 'TH', filterMatchers: ['Thailand'] },
];

const destinationLabels: Record<string, string> = {
  ES: 'Spain', US: 'United States', DE: 'Germany', FR: 'France',
  IT: 'Italy', PT: 'Portugal', JP: 'Japan', TH: 'Thailand',
};

const popularDestinations = [
  { code: 'ES', label: 'Spain' },
  { code: 'US', label: 'United States' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
];

export function TravelHub({ accountType = 'personal' }: { accountType?: AccountType }) {
  const { t } = useLanguage();
  const [destination, setDestination] = useState<string | null>(null);

  return (
    <div className="travel-hub-page">
      <h1 className="np-text-title-screen" style={{ margin: '0 0 24px' }}>{t('travelHub.title')}</h1>

      <div className="travel-hub-page__grid">
        {/* Left column */}
        <div className="travel-hub-page__left">
          <h3 className="np-text-title-subsection" style={{ margin: '0 0 12px' }}>
            {t('travelHub.prepareTrip')}
          </h3>

          <div className="travel-hub-page__lounge-card">
            <img
              src="/lounge-thumbnail.jpg"
              alt="Airport lounge"
              className="travel-hub-page__lounge-img"
            />
            <div className="travel-hub-page__lounge-overlay">
              <span className="travel-hub-page__lounge-title np-text-display-small">Airport lounge<br />access</span>
              <div className="travel-hub-page__lounge-actions">
                <button type="button" className="travel-hub-page__lounge-cta">
                  {t('travelHub.loungePrice')}
                </button>
                <button className="travel-hub-page__lounge-arrow" type="button">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <h3 className="np-text-title-subsection" style={{ margin: '24px 0 12px' }}>
            {t('travelHub.tipsAbroad')}
          </h3>

          <div className="travel-hub-page__search">
            <SelectInput
              placeholder={t('travelHub.searchDestination')}
              items={destinationItems}
              value={destination ?? undefined}
              filterable
              renderValue={(val) => (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flag code={val} /></span>
                  {destinationLabels[val] ?? val}
                </span>
              )}
              onChange={(val: any) => setDestination(val)}
            />
          </div>

          <div className="travel-hub-page__destinations">
            {popularDestinations.map((dest) => (
              <button key={dest.code} className="travel-hub-page__destination-chip" type="button" onClick={() => setDestination(dest.code)}>
                <span className="travel-hub-page__destination-flag"><Flag code={dest.code} /></span>
                <span className="np-text-body-default" style={{ fontWeight: 500 }}>{dest.label}</span>
              </button>
            ))}
          </div>

          <h3 className="np-text-title-subsection" style={{ margin: '24px 0 12px' }}>
            {t('travelHub.usingCardOverseas')}
          </h3>

          <div className="travel-hub-page__tips">
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('travelHub.smartConversion')}</span>}
              subtitle={t('travelHub.smartConversionSub')}
              media={
                <ListItem.AvatarView size={48}>
                  <Lightning size={24} />
                </ListItem.AvatarView>
              }
            />
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('travelHub.payLocal')}</span>}
              subtitle={t('travelHub.payLocalSub')}
              media={
                <ListItem.AvatarView size={48}>
                  <Coins size={24} />
                </ListItem.AvatarView>
              }
            />
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('travelHub.withdrawCash')}</span>}
              subtitle={t('travelHub.withdrawCashSub')}
              media={
                <ListItem.AvatarView size={48}>
                  <Bank size={24} />
                </ListItem.AvatarView>
              }
            />
          </div>
        </div>

        {/* Right column — stamps card */}
        <div className="travel-hub-page__right">
          <h3 className="np-text-title-subsection" style={{ margin: '0 0 12px' }}>
            {t('travelHub.stamps')}
          </h3>
          <div className="travel-hub-page__stamps-card">
            <div className="travel-hub-page__stamps-inner">
              <img
                src="/stamps-passport.png"
                alt="Travel stamps"
                className="travel-hub-page__stamps-img"
              />
              <Button v2 size="md" priority="primary">
                {t('travelHub.howToCollect')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
