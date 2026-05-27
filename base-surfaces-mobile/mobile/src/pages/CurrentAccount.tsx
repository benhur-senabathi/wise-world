import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Money, Savings, Suitcase, Upload, Edit, Document, CrossCircle, People, Heart, Backpack } from '@transferwise/icons';
import { Button, ListItem, AvatarLayout } from '@transferwise/components';
import { LiquidGlassSegmentedControl } from '../components/LiquidGlassSegmentedControl';
import { Flag } from '@wise/art';
import type { AccountType } from '../App';
import { AccountPageHeader } from '../components/AccountPageHeader';
import { ActivitySummary } from '../components/ActivitySummary';
import { useActiveCurrencies, useActiveTransactions } from '../hooks/useDatasetData';
import { groupByDate, type Transaction } from '@shared/data/transactions';
import type { CurrencyData } from '@shared/data/currencies';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, useTxLabels } from '../context/Language';
import { convertToHomeCurrency, usdBaseRates } from '@shared/data/currency-rates';

import type { JarDefinition } from '@shared/data/jar-data';
import { getAccountBySubPageType, type AccountDefinition } from '@shared/data/account-registry';
import { useAllCards } from '../hooks/useAccountRegistry';

type Props = {
  onNavigateCurrency?: (code: string) => void;
  onNavigateCards?: () => void;
  onAccountDetails?: () => void;
  accountType?: AccountType;
  group?: string;
  joint?: boolean;
  youngExplorer?: boolean;
  jarConfig?: JarDefinition;
  onAdd?: () => void;
  onConvert?: () => void;
  onSend?: () => void;
  onRequest?: () => void;
  onPaymentLink?: () => void;
  moreMenuOpen?: boolean;
  onMoreMenuClose?: () => void;
  personalAvatarUrl?: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Money: <Money size={16} />,
  People: <People size={16} />,
  Heart: <Heart size={16} />,
  Backpack: <Backpack size={16} />,
  Savings: <Savings size={16} />,
  Suitcase: <Suitcase size={16} />,
};
function AccountIcon({ iconName }: { iconName: string }) {
  return <>{ICON_MAP[iconName] || <Money size={16} />}</>;
}

function CurrenciesSection({ onNavigateCurrency, activeCurrencies, isGroup, hideAddCurrency, hideInterest }: { onNavigateCurrency?: (code: string) => void; activeCurrencies: CurrencyData[]; isGroup?: boolean; hideAddCurrency?: boolean; hideInterest?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="section-card">
      <ul className="wds-list list-unstyled m-y-0">
        {!hideAddCurrency && <ListItem
          title={t('currentAccount.addCurrency')}
          media={
            <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
              <Plus size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />}
        {activeCurrencies.map((c) => {
          let subtitle = c.name;
          if (!isGroup) {
            if (c.hasStocks) subtitle += ` • ${t('currentAccount.investedInStocks')}`;
            else if (c.hasInterest) subtitle += ` • ${t('currentAccount.investedInInterest')}`;
          } else if (c.hasInterest && !hideInterest) {
            subtitle += ` • ${t('currentAccount.earnInterestRate')}`;
          }

          return (
            <ListItem
              key={c.code}
              title={c.balance === 0 ? `0 ${c.code}` : `${c.balance.toFixed(2)} ${c.code}`}
              subtitle={subtitle}
              media={<ListItem.AvatarView size={48} style={{ border: '1px solid var(--color-border-neutral)' }}><Flag code={c.code} loading="eager" /></ListItem.AvatarView>}
              control={<ListItem.Navigation onClick={() => onNavigateCurrency?.(c.code)} />}
            />
          );
        })}
      </ul>
      {!isGroup && (
        <p className="np-text-body-small" style={{ color: 'var(--color-content-secondary)', padding: '16px 0 0', margin: 0, textAlign: 'center' }}>
          {t('currentAccount.disclaimer')}
        </p>
      )}
    </div>
  );
}

function TransactionsSection({ activeTransactions }: { activeTransactions: Transaction[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const isSearching = search.length >= 3;
  const filtered = isSearching
    ? activeTransactions.filter((tx) => tx.name.toLowerCase().includes(search.toLowerCase()))
    : activeTransactions;
  const grouped = groupByDate(filtered);

  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setBackToTopVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="section-card" ref={sectionRef}>
      {activeTransactions.length === 0 && (
        <div className="section-card__empty">
          <h3 className="section-card__title" style={{ margin: '0 0 8px' }}>{t('currencyPage.nothingYet')}</h3>
          <p className="np-text-body-default" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>{t('currencyPage.txWillShow')}</p>
        </div>
      )}

      {isSearching && grouped.length === 0 && activeTransactions.length > 0 && (
        <p className="np-text-body-default" style={{ margin: '24px 0', fontWeight: 600, color: 'var(--color-content-primary)' }}>{t('transactions.noResults')}</p>
      )}

      <ul className="wds-list list-unstyled m-y-0 transactions-list">
        {grouped.flatMap(([date, txs]) =>
          txs.map((tx, i) => (
            <ActivitySummary
              key={`${date}-${i}`}
              icon={tx.icon}
              imgSrc={tx.imgSrc}
              name={tx.name}
              subtitle={tx.subtitle ? `${tx.subtitle} · ${date}` : date}
              amount={tx.amount}
              amountSub={tx.amountSub}
              isPositive={tx.isPositive}
            />
          ))
        )}
      </ul>

      <div
        className={`back-to-top${backToTopVisible ? ' back-to-top--visible' : ''}`}
      >
        <Button v2 size="sm" priority="primary" onClick={handleBackToTop}>{t('common.backToTop')}</Button>
      </div>
    </div>
  );
}

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

function CardThumbnail({ variant, image }: { variant?: string; image?: string }) {
  const src = image ? (mediumCardMap[image] || image) : undefined;
  if (src) {
    return (
      <div className="card-thumbnail">
        <img src={src} alt="" className="card-thumbnail__img" />
      </div>
    );
  }
  let flagColor = '#0e0f0c';
  if (variant === 'digital' || variant === 'biz-aqua' || variant === 'biz-green' || variant === 'biz-orange') flagColor = '#fff';
  if (variant === 'biz-physical') flagColor = '#9fe870';
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

function SpendCardMedia({ accountType = 'personal', cardCount = 2, accountDef }: { accountType?: AccountType; cardCount?: number; accountDef?: AccountDefinition }) {
  const isBusiness = accountType === 'business';
  const allCards = accountDef?.getCards(accountType) ?? [];
  const cards = allCards.slice(0, cardCount);

  if (cards.length >= 2) {
    return (
      <div className="spend-card-media">
        <CardThumbnail image={cards[1].image} />
        <CardThumbnail image={cards[0].image} />
      </div>
    );
  }
  if (cards.length === 1) {
    return (
      <div className="spend-card-media">
        <CardThumbnail image={cards[0].image} />
      </div>
    );
  }

  return (
    <div className="spend-card-media">
      {cardCount >= 2 && <CardThumbnail variant={isBusiness ? 'biz-aqua' : 'digital'} />}
      <CardThumbnail variant={isBusiness ? 'biz-physical' : 'physical'} />
    </div>
  );
}

function TeamAvatarMedia({ personalAvatarUrl, accountDef }: { personalAvatarUrl?: string; accountDef?: AccountDefinition }) {
  const participant = accountDef?.participants[0];
  return (
    <AvatarLayout
      size={48}
      orientation="diagonal"
      avatars={[
        { imgSrc: personalAvatarUrl || 'https://www.tapback.co/api/avatar/connor-berry.webp' },
        { imgSrc: participant?.imgSrc || 'https://www.tapback.co/api/avatar/alex-kumar.webp' },
      ]}
    />
  );
}

function SidebarContent({ onNavigateCards, accountType = 'personal', group, joint, youngExplorer, accountLabel, personalAvatarUrl, cardCount = 2, hasCards = true, accountDef }: { onNavigateCards?: () => void; accountType?: AccountType; group?: string; joint?: boolean; youngExplorer?: boolean; accountLabel?: string; personalAvatarUrl?: string; cardCount?: number; hasCards?: boolean; accountDef?: AccountDefinition }) {
  const { t } = useLanguage();
  const isBusiness = accountType === 'business';
  const isGroup = !!group;
  const isJoint = !!joint;
  const isYoungExplorer = !!youngExplorer;
  const hasParticipants = accountDef?.features.hasParticipants ?? (isGroup || isJoint || isYoungExplorer);
  const isTeamStyle = accountDef?.features.participantStyle === 'team';
  const participant = accountDef?.participants[0];
  const name = accountLabel ?? '';
  return (
    <>
      {hasCards && cardCount > 0 && (
        <ListItem
          spotlight="active"
          title={isBusiness ? t('cards.title') : t('currentAccount.spend')}
          subtitle={t('currentAccount.cardsInAccount', { count: cardCount, name })}
          media={<SpendCardMedia accountType={accountType} cardCount={cardCount} accountDef={accountDef} />}
          control={<ListItem.Navigation onClick={() => onNavigateCards?.()} />}
        />
      )}
      {hasParticipants && participant && (
        <div style={{ marginTop: 16 }}>
          <ListItem
            spotlight="active"
            title={isTeamStyle ? t('team.title') : t('currentAccount.sharing')}
            subtitle={isTeamStyle ? t('currentAccount.teamInGroup', { name }) : `${participant.name} · ${t('currentAccount.member')}`}
            media={<div style={{ display: 'flex', alignItems: 'center', minHeight: 48 }}><TeamAvatarMedia personalAvatarUrl={personalAvatarUrl} accountDef={accountDef} /></div>}
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        </div>
      )}
      {!isBusiness && !isGroup && !isJoint && !isYoungExplorer && (
        <div style={{ marginTop: 16 }}>
          <ListItem
            spotlight="inactive"
            title={t('currentAccount.autoTopup')}
            subtitle={t('currentAccount.autoTopupSub')}
            media={
              <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                <Upload size={24} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        </div>
      )}
      <p className="np-text-body-default" style={{ margin: '32px 0 0', textAlign: 'center', color: 'var(--color-content-secondary)' }}>
        {t('currentAccount.changesFooter')}
      </p>
      <p className="np-text-body-default" style={{ margin: '4px 0 0', textAlign: 'center' }}>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--color-content-link)', fontWeight: 600, textDecoration: 'underline' }}>{t('common.giveFeedback')}</a>
      </p>
    </>
  );
}

export function CurrentAccount({ onNavigateCurrency, onNavigateCards, onAccountDetails, accountType = 'personal', group, joint, youngExplorer, jarConfig, onAdd, onConvert, onSend, onRequest, onPaymentLink, moreMenuOpen, onMoreMenuClose, personalAvatarUrl }: Props) {
  const { consumerName, businessName } = usePrototypeNames();
  const { t } = useLanguage();
  const txLabels = useTxLabels();
  const [activeTab, setActiveTab] = useState('currencies');

  const datasetCurrencies = useActiveCurrencies(accountType);
  const datasetTransactions = useActiveTransactions(accountType, consumerName, businessName, txLabels);

  const rates = usdBaseRates;
  const isGroup = !!group;
  const isJar = !!jarConfig;
  const isJoint = !!joint;
  const isYoungExplorer = !!youngExplorer;
  const isSharedSpending = group === 'shared-spending';

  // Resolve account definition from registry
  const subPageType = isJar ? null : isSharedSpending ? 'shared-spending-account' : isGroup ? 'group-account' : isJoint ? 'joint-account' : isYoungExplorer ? 'young-explorer-account' : 'account';
  const accountDef = subPageType ? getAccountBySubPageType(subPageType) : undefined;
  const features = accountDef?.features;

  const isCurrentAccount = accountDef?.subPageType === 'account';
  const allDatasetCards = useAllCards(accountType);
  const activeCurrencies = isJar ? jarConfig.currencies : (accountDef && !isCurrentAccount) ? accountDef.getCurrencies() : datasetCurrencies;
  const activeTransactions = isJar ? jarConfig.transactions : (accountDef && !isCurrentAccount) ? accountDef.getTransactions() : datasetTransactions;
  const cardCount = isJar ? 0 : isCurrentAccount
    ? allDatasetCards.filter((c) => c.accountNameKey === 'home.currentAccount').length
    : accountDef ? accountDef.getCards(accountType).length : 0;
  const displayCode = activeCurrencies[0]?.code ?? 'GBP';
  const activeTotal = activeCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, displayCode, rates), 0);
  const balanceFormatted = `${activeTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${displayCode}`;
  const accountLabel = isJar ? t(jarConfig.nameKey) : accountDef ? t(accountDef.nameKey) : t('home.currentAccount');

  // Menu items from registry
  const menuItemIconMap: Record<string, React.ReactNode> = {
    'currentAccount.editCurrentAccount': <Edit size={24} />,
    'currentAccount.editGroup': <Edit size={24} />,
    'currentAccount.editSharedSpending': <Edit size={24} />,
    'currentAccount.editJointAccount': <Edit size={24} />,
    'currentAccount.editYoungExplorer': <Edit size={24} />,
    'common.statementsAndReports': <Document size={24} />,
    'currentAccount.closeGroup': <CrossCircle size={24} />,
    'currentAccount.closeSharedSpending': <CrossCircle size={24} />,
    'currentAccount.closeYoungExplorer': <CrossCircle size={24} />,
  };
  const menuItems = isJar
    ? [{ label: t('currentAccount.editJar'), icon: <Edit size={24} /> }, { label: t('common.statementsAndReports'), icon: <Document size={24} /> }, { label: t('currentAccount.closeJar'), icon: <CrossCircle size={24} /> }]
    : accountDef
      ? accountDef.menuItemKeys.map((key) => ({ label: t(key), icon: menuItemIconMap[key] || <Document size={24} /> }))
      : [{ label: t('currentAccount.editCurrentAccount'), icon: <Edit size={24} /> }, { label: t('common.statementsAndReports'), icon: <Document size={24} /> }];

  const headerType = isJar ? 'jar' as const : (isGroup || isJoint || isYoungExplorer) ? 'group' as const : 'account' as const;
  const jarIcon = isJar ? (jarConfig.iconName === 'Suitcase' ? <Suitcase size={16} /> : <Savings size={16} />) : undefined;

  return (
    <div className="current-account">
      <AccountPageHeader
        type={headerType}
        label={accountLabel}
        balance={balanceFormatted}
        menuItems={menuItems}
        moreMenuOpen={moreMenuOpen}
        onMoreMenuClose={onMoreMenuClose}
        onAccountDetailsClick={isJar ? undefined : features?.hasAccountDetails === false ? undefined : onAccountDetails}
        accountType={accountType}
        jarColor={isJar ? jarConfig.color : accountDef && accountDef.subPageType !== 'account' ? accountDef.style.color : undefined}
        jarTextColor={accountDef && accountDef.subPageType !== 'account' ? accountDef.style.textColor : undefined}
        jarIcon={jarIcon || (accountDef && accountDef.subPageType !== 'account' ? <AccountIcon iconName={accountDef.style.iconName} /> : undefined)}
        hideGetPaid={isJar || (features?.hasRequest === false)}
        moveOnly={features?.moveOnly}
        onAdd={onAdd}
        onConvert={features?.hasConvert === false ? undefined : onConvert}
        onSend={features?.hasSend === false ? undefined : onSend}
        onRequest={isJar || features?.hasRequest === false ? undefined : onRequest}
        onPaymentLink={isJar || features?.hasPaymentLink === false ? undefined : onPaymentLink}
      />

      <div>
        <div className="current-account__tabs">
          <LiquidGlassSegmentedControl
            name="account-tabs"
            segments={isJar && accountType !== 'personal' ? [
              { id: 'tab-currencies', value: 'currencies', label: t('currentAccount.tab.currencies') },
              { id: 'tab-transactions', value: 'transactions', label: t('currentAccount.tab.transactions') },
            ] : [
              { id: 'tab-currencies', value: 'currencies', label: t('currentAccount.tab.currencies') },
              { id: 'tab-transactions', value: 'transactions', label: t('currentAccount.tab.transactions') },
              { id: 'tab-options', value: 'options', label: t('currentAccount.tab.options') },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {activeTab === 'currencies' && <CurrenciesSection onNavigateCurrency={onNavigateCurrency} activeCurrencies={activeCurrencies} isGroup={isGroup && !isJar} hideAddCurrency={features?.hideAddCurrency} hideInterest={features?.singleCurrency} />}
        {activeTab === 'transactions' && <TransactionsSection activeTransactions={activeTransactions} />}
        {activeTab === 'options' && !isJar && <SidebarContent onNavigateCards={onNavigateCards} accountType={accountType} group={group} joint={isJoint} youngExplorer={isYoungExplorer} accountLabel={accountLabel} personalAvatarUrl={personalAvatarUrl} cardCount={cardCount} hasCards={accountDef ? accountDef.features.hasCards : false} accountDef={accountDef} />}
        {activeTab === 'options' && isJar && accountType === 'personal' && (
          <div style={{ padding: '16px 0' }}>
            <ListItem
              spotlight="inactive"
              title={t('currentAccount.setSavingsGoal')}
              subtitle={t('currentAccount.savingsGoalSub')}
              media={<div className="savings-goal-circle" />}
              control={<ListItem.Navigation onClick={() => {}} />}
            />
          </div>
        )}
      </div>
    </div>
  );
}
