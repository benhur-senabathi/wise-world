import { useState } from 'react';
import { ListItem, AvatarView, Tabs, Button, Table, SearchInput, Size } from '@transferwise/components';
import { Plus, Limit, Suitcase, Team, Alert } from '@transferwise/icons';
import type { AccountType } from '@shared/data/account-registry';
import { useAllCards, useVisibleAccounts } from '../hooks/useAccountRegistry';
import { useLanguage } from '../context/Language';
import './Cards.css';

const mediumCardMap: Record<string, string> = {
  '/wise-card-physical.png': '/wise-card-medium-physical.png',
  '/wise-card-personal-digital-turquoise.png': '/wise-card-medium-turquoise.png',
  '/wise-card-personal-digital-green.png': '/wise-card-medium-green.png',
  '/wise-card-personal-digital-blue.png': '/wise-card-medium-blue.png',
  '/wise-card-personal-digital-fire.png': '/wise-card-medium-fire.png',
  '/wise-card-personal-digital-pink-blue.png': '/wise-card-medium-pink-blue.png',
  '/wise-card-biz-physical.png': '/wise-card-medium-biz-green.png',
  '/wise-card-biz-digital-aqua.png': '/wise-card-medium-biz-aqua.png',
  '/wise-card-biz-digital-yellow.png': '/wise-card-medium-biz-yellow.png',
  '/wise-card-biz-digital-green.png': '/wise-card-medium-biz-green.png',
  '/wise-card-biz-digital-orange.png': '/wise-card-medium-orange.png',
};

function CardThumbnail({ image }: { image: string }) {
  const src = mediumCardMap[image] || image;
  return (
    <div className="card-thumbnail">
      <img src={src} alt="" className="card-thumbnail__img" />
    </div>
  );
}

function CardsList({ accountType }: { accountType: AccountType }) {
  const { t } = useLanguage();
  const allCards = useAllCards(accountType);
  const currentAccountCards = allCards.filter((c) => c.accountNameKey === 'home.currentAccount');
  const subAccountCards = allCards.filter((c) => c.accountNameKey !== 'home.currentAccount');

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
        {currentAccountCards.map((card, i) => (
          <ListItem
            key={`current-${i}`}
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{card.type === 'physical' ? 'Physical' : 'Digital card'} •••• {card.lastFour}</span>}
            subtitle={t('common.readyToUse')}
            media={<CardThumbnail image={card.image} />}
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        ))}
        {subAccountCards.map((card, i) => (
          <ListItem
            key={`sub-${i}`}
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{card.type === 'physical' ? 'Physical' : 'Digital card'} •••• {card.lastFour}</span>}
            subtitle={`${t(card.accountNameKey as any)} • ${t('common.readyToUse')}`}
            media={<CardThumbnail image={card.image} />}
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        ))}
      </ul>
    </>
  );
}

function TeamCardsList({ accountType }: { accountType: AccountType }) {
  const { t } = useLanguage();
  const visibleAccounts = useVisibleAccounts(accountType);
  const teamAccounts = visibleAccounts.filter((a) => a.features.participantStyle === 'team' && a.participants.length > 0);
  const teamParticipants = teamAccounts.flatMap((a) =>
    a.participants.map((p) => ({ ...p, cardCount: a.getCards(accountType).length, cards: a.getCards(accountType) }))
  );
  const [search, setSearch] = useState('');
  const isSearching = search.length >= 2;
  const filteredParticipants = isSearching
    ? teamParticipants.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : teamParticipants;

  const headers = [
    { header: t('cards.cardholder'), width: '44%' },
    { header: t('cards.card'), width: '28%' },
    { header: t('cards.status') },
  ];

  const dataRows = filteredParticipants.map((p, i) => ({
    id: i,
    cells: [
      {
        children: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AvatarView size={40} imgSrc={p.imgSrc} style={{ border: 'none' }} />
            <span className="np-text-body-default" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{p.name}</span>
          </div>
        ),
      },
      {
        children: p.cards[0] ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CardThumbnail image={p.cards[0].image} />
            <div>
              <span className="np-text-body-default" style={{ fontWeight: 600, display: 'block', color: 'var(--color-content-primary)' }}>•••• {p.cards[0].lastFour}</span>
              <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{t('cards.digitalCard')}</span>
            </div>
          </div>
        ) : null,
      },
      {
        children: (
          <span className="np-text-body-default" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{t('common.readyToUse')}</span>
        ),
      },
    ],
  }));

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
          rows: filteredParticipants.length > 0 ? dataRows : emptyRow,
          ...(filteredParticipants.length > 0 ? { onRowClick: () => {} } : {}),
        }}
        fullWidth
        className="team-cards-table"
      />
    </div>
  );
}

export function Cards({ accountType = 'personal', onTravelHub }: { accountType?: AccountType; onTravelHub?: () => void } = {}) {
  const { t } = useLanguage();
  const visibleAccounts = useVisibleAccounts(accountType);
  const hasTeamTab = accountType === 'business' && visibleAccounts.some((a) => a.features.participantStyle === 'team');
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

      {hasTeamTab ? (
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
              content: <TeamCardsList accountType={accountType} />,
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
