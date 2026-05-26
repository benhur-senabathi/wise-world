import { useState } from 'react';
import { ListItem, AvatarView, Tabs, Button, Table, SearchInput, Size } from '@transferwise/components';
import { Plus, Limit, Suitcase, Team, Alert } from '@transferwise/icons';
import type { AccountType } from '../App';
import { useCardCount, useHasGroup } from '../hooks/useDatasetData';
import { useLanguage } from '../context/Language';

function CardThumbnail({ variant }: { variant: 'physical' | 'digital' }) {
  const flagColor = variant === 'digital' ? '#fff' : '#0e0f0c';
  return (
    <div className={`card-thumbnail card-thumbnail--${variant}`}>
      <svg className="card-thumbnail__flag" width="14" height="13" viewBox="0 0 24 24" fill={flagColor} aria-hidden="true">
        <path d="M1.875 15.28 7.35 8.838h-.002L4.02 3h18.105l-7.008 19.375h-3.97L16.95 6.3H9.463l1.665 2.883-.008.08-2.56 2.979h4.188l-1.098 3.037z" />
      </svg>
      <div className="card-thumbnail__light" />
      <div className="card-thumbnail__shadow" />
    </div>
  );
}

function BusinessCardThumbnail({ variant }: { variant: 'biz-physical' | 'biz-aqua' | 'biz-green' | 'biz-orange' | 'biz-purple' }) {
  const flagColor = variant === 'biz-physical' ? '#9fe870' : '#fff';
  return (
    <div className={`card-thumbnail card-thumbnail--${variant}`}>
      <svg className="card-thumbnail__flag" width="14" height="13" viewBox="0 0 24 24" fill={flagColor} aria-hidden="true">
        <path d="M1.875 15.28 7.35 8.838h-.002L4.02 3h18.105l-7.008 19.375h-3.97L16.95 6.3H9.463l1.665 2.883-.008.08-2.56 2.979h4.188l-1.098 3.037z" />
      </svg>
      <div className="card-thumbnail__light" />
      <div className="card-thumbnail__shadow" />
    </div>
  );
}

function CardsList({ accountType }: { accountType: AccountType }) {
  const { t } = useLanguage();
  const cardCount = useCardCount(accountType);
  const hasTaxes = useHasGroup(accountType);
  const isBusiness = accountType === 'business';
  return (
    <>
      <ul className="wds-list list-unstyled m-y-0 cards-list">
        <ListItem
          title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('cards.orderNewCard')}</span>}
          subtitle={t('cards.orderNewCardSub')}
          media={
            <ListItem.AvatarView size={48}>
              <Plus size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
        <ListItem
          title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('cards.spendingLimits')}</span>}
          subtitle={t('cards.spendingLimitsSub')}
          media={
            <ListItem.AvatarView size={48}>
              <Limit size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
      </ul>

      <ul className="wds-list list-unstyled m-y-0 cards-list cards-list--cards">
        {isBusiness ? (
          <>
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Physical •••• 5271</span>}
              subtitle={t('common.readyToUse')}
              media={<BusinessCardThumbnail variant="biz-physical" />}
              control={<ListItem.Navigation onClick={() => {}} />}
            />
            {cardCount >= 2 && (
              <ListItem
                title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Digital card •••• 9034</span>}
                subtitle={t('common.readyToUse')}
                media={<BusinessCardThumbnail variant="biz-aqua" />}
                control={<ListItem.Navigation onClick={() => {}} />}
              />
            )}
            {hasTaxes && (
              <>
                <ListItem
                  title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Digital card •••• 4219</span>}
                  subtitle={t('cards.taxesReadyToUse')}
                  media={<BusinessCardThumbnail variant="biz-green" />}
                  control={<ListItem.Navigation onClick={() => {}} />}
                />
                <ListItem
                  title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Digital card •••• 7803</span>}
                  subtitle={t('cards.taxesReadyToUse')}
                  media={<BusinessCardThumbnail variant="biz-orange" />}
                  control={<ListItem.Navigation onClick={() => {}} />}
                />
              </>
            )}
          </>
        ) : (
          <>
            <ListItem
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Physical •••• 8130</span>}
              subtitle={t('common.readyToUse')}
              media={<CardThumbnail variant="physical" />}
              control={<ListItem.Navigation onClick={() => {}} />}
            />
            {cardCount >= 2 && (
              <ListItem
                title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>Digital card •••• 6663</span>}
                subtitle={t('common.readyToUse')}
                media={<CardThumbnail variant="digital" />}
                control={<ListItem.Navigation onClick={() => {}} />}
              />
            )}
          </>
        )}
      </ul>
    </>
  );
}

function TeamCardsList() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const isSearching = search.length >= 2;
  const hasResults = !isSearching || 'jamie reynolds'.includes(search.toLowerCase());

  const headers = [
    { header: t('cards.cardholder'), width: '44%' },
    { header: t('cards.card'), width: '28%' },
    { header: t('cards.status') },
  ];

  const dataRows = [
    {
      id: 0,
      cells: [
        {
          children: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AvatarView size={40} imgSrc="https://www.tapback.co/api/avatar/jamie-reynolds.webp" style={{ border: 'none' }} />
              <span className="np-text-body-default" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>Jamie Reynolds</span>
            </div>
          ),
        },
        {
          children: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BusinessCardThumbnail variant="biz-purple" />
              <div>
                <span className="np-text-body-default" style={{ fontWeight: 600, display: 'block', color: 'var(--color-content-primary)' }}>•••• 7165</span>
                <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{t('cards.digitalCard')}</span>
              </div>
            </div>
          ),
        },
        {
          children: (
            <span className="np-text-body-default" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{t('common.readyToUse')}</span>
          ),
        },
      ],
    },
  ];

  const emptyRow = [
    {
      id: 0,
      cells: [
        {
          children: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AvatarView size={40} style={{ backgroundColor: 'var(--color-sentiment-warning)', border: 'none', color: '#4a3b1c' }}>
                <Alert size={24} />
              </AvatarView>
              <span className="np-text-body-default" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{t('common.noResultsFound')}</span>
            </div>
          ),
        },
        { children: null },
        { children: null },
      ],
    },
  ];

  return (
    <div className="team-cards">
      <ul className="wds-list list-unstyled m-y-0 cards-list">
        <ListItem
          title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('cards.teamSpendingLimits')}</span>}
          subtitle={t('cards.teamSpendingLimitsSub')}
          media={
            <ListItem.AvatarView size={48}>
              <Team size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
      </ul>

      <div className="team-cards__header">
        <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('cards.teamCardCount')}</h3>
        <div className="team-cards__search">
          <SearchInput
            placeholder={t('cards.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size={Size.SMALL}
          />
        </div>
      </div>

      <Table
        data={{
          headers,
          rows: hasResults ? dataRows : emptyRow,
          ...(hasResults ? { onRowClick: () => {} } : {}),
        }}
        fullWidth
        className="team-cards-table"
      />
    </div>
  );
}

export function Cards({ accountType = 'personal', onTravelHub }: { accountType?: AccountType; onTravelHub?: () => void } = {}) {
  const { t } = useLanguage();
  const hasTaxes = useHasGroup(accountType);
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="cards-page">
      <div className="cards-page__header">
        <h1 className="np-text-title-screen" style={{ margin: 0 }}>{t('cards.title')}</h1>
        <button className="cards-travel-hub-btn" type="button" onClick={onTravelHub}>
          <AvatarView size={32} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
            <Suitcase size={16} />
          </AvatarView>
          <span>{t('cards.travelHub')}</span>
        </button>
      </div>

      {accountType === 'business' && hasTaxes ? (
        <Tabs
          name="cards-tabs"
          selected={selectedTab}
          onTabSelect={setSelectedTab}
          headerWidth="auto"
          tabs={[
            {
              title: t('cards.yourCards'),
              disabled: false,
              content: <CardsList accountType={accountType} />,
            },
            {
              title: t('cards.teamCards'),
              disabled: false,
              content: <TeamCardsList />,
            },
          ]}
        />
      ) : (
        <div className="np-section m-b-4">
          <h5 className="np-text-title-group np-header np-header--group p-y-2" style={{ margin: 0, paddingTop: 8 }}>
            {t('cards.yourCards')}
          </h5>
          <CardsList accountType={accountType} />
        </div>
      )}
    </div>
  );
}
