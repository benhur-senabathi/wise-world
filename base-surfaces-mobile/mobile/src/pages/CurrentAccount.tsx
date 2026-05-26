import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Money, Savings, Suitcase, Upload, Edit, Document, CrossCircle } from '@transferwise/icons';
import { Button, ListItem, AvatarLayout, AvatarView } from '@transferwise/components';
import { LiquidGlassSegmentedControl } from '../components/LiquidGlassSegmentedControl';
import { Flag } from '@wise/art';
import type { AccountType } from '../App';
import { AccountPageHeader } from '../components/AccountPageHeader';
import { ActivitySummary } from '../components/ActivitySummary';
import { useActiveCurrencies, useActiveTransactions, useCardCount } from '../hooks/useDatasetData';
import { groupByDate, type Transaction } from '@shared/data/transactions';
import type { CurrencyData } from '@shared/data/currencies';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, useTxLabels } from '../context/Language';
import { convertToHomeCurrency, usdBaseRates } from '@shared/data/currency-rates';

import { groupCurrencies, groupTransactions } from '@shared/data/group-data';
import type { JarDefinition } from '@shared/data/jar-data';

type Props = {
  onNavigateCurrency?: (code: string) => void;
  onNavigateCards?: () => void;
  onAccountDetails?: () => void;
  accountType?: AccountType;
  group?: string;
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

function CurrenciesSection({ onNavigateCurrency, activeCurrencies, isGroup }: { onNavigateCurrency?: (code: string) => void; activeCurrencies: CurrencyData[]; isGroup?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="section-card">
      <ul className="wds-list list-unstyled m-y-0">
        <ListItem
          title={t('currentAccount.addCurrency')}
          media={
            <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
              <Plus size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
        {activeCurrencies.map((c) => {
          let subtitle = c.name;
          if (!isGroup) {
            if (c.hasStocks) subtitle += ` • ${t('currentAccount.investedInStocks')}`;
            else if (c.hasInterest) subtitle += ` • ${t('currentAccount.investedInInterest')}`;
            else if (c.code === 'GBP') subtitle += ` • ${t('currentAccount.earnInterestRate')}`;
          } else if (c.code === 'GBP') {
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

function CardThumbnail({ variant }: { variant: 'physical' | 'digital' | 'biz-physical' | 'biz-aqua' | 'biz-green' | 'biz-orange' }) {
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

function SpendCardMedia({ accountType = 'personal', group, cardCount = 2 }: { accountType?: AccountType; group?: string; cardCount?: number }) {
  const isBusiness = accountType === 'business';
  const isGroup = !!group;
  if (isGroup) {
    return (
      <div className="spend-card-media">
        <CardThumbnail variant="biz-orange" />
        <CardThumbnail variant="biz-green" />
      </div>
    );
  }
  if (cardCount <= 1) {
    return (
      <div className="spend-card-media">
        <CardThumbnail variant={isBusiness ? 'biz-physical' : 'physical'} />
      </div>
    );
  }
  return (
    <div className="spend-card-media">
      <CardThumbnail variant={isBusiness ? 'biz-aqua' : 'digital'} />
      <CardThumbnail variant={isBusiness ? 'biz-physical' : 'physical'} />
    </div>
  );
}

function TeamAvatarMedia({ personalAvatarUrl }: { personalAvatarUrl?: string }) {
  return (
    <AvatarLayout
      size={48}
      orientation="diagonal"
      avatars={[
        { imgSrc: personalAvatarUrl || 'https://www.tapback.co/api/avatar/connor-berry.webp' },
        { imgSrc: 'https://www.tapback.co/api/avatar/jamie-reynolds.webp' },
      ]}
    />
  );
}

function SidebarContent({ onNavigateCards, accountType = 'personal', group, accountLabel, personalAvatarUrl, cardCount = 2 }: { onNavigateCards?: () => void; accountType?: AccountType; group?: string; accountLabel?: string; personalAvatarUrl?: string; cardCount?: number }) {
  const { t } = useLanguage();
  const isBusiness = accountType === 'business';
  const isGroup = !!group;
  const name = accountLabel ?? '';
  return (
    <>
      <ListItem
        spotlight="active"
        title={isBusiness ? t('cards.title') : t('currentAccount.spend')}
        subtitle={t('currentAccount.cardsInAccount', { count: cardCount, name })}
        media={<SpendCardMedia accountType={accountType} group={group} cardCount={cardCount} />}
        control={<ListItem.Navigation onClick={() => onNavigateCards?.()} />}
      />
      {isGroup && (
        <div style={{ marginTop: 16 }}>
          <ListItem
            spotlight="active"
            title={t('team.title')}
            subtitle={t('currentAccount.teamInGroup', { name })}
            media={<div style={{ display: 'flex', alignItems: 'center', minHeight: 48 }}><TeamAvatarMedia personalAvatarUrl={personalAvatarUrl} /></div>}
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        </div>
      )}
      {!isBusiness && !isGroup && (
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

export function CurrentAccount({ onNavigateCurrency, onNavigateCards, onAccountDetails, accountType = 'personal', group, jarConfig, onAdd, onConvert, onSend, onRequest, onPaymentLink, moreMenuOpen, onMoreMenuClose, personalAvatarUrl }: Props) {
  const { consumerName, businessName } = usePrototypeNames();
  const { t } = useLanguage();
  const txLabels = useTxLabels();
  const [activeTab, setActiveTab] = useState('currencies');

  const cardCount = useCardCount(accountType);
  const datasetCurrencies = useActiveCurrencies(accountType);
  const datasetTransactions = useActiveTransactions(accountType, consumerName, businessName, txLabels);

  const rates = usdBaseRates;
  const isGroup = !!group;
  const isJar = !!jarConfig;
  const activeCurrencies = isJar ? jarConfig.currencies : isGroup ? groupCurrencies : datasetCurrencies;
  const activeTransactions = isJar ? jarConfig.transactions : isGroup ? groupTransactions : datasetTransactions;
  const displayCode = activeCurrencies[0]?.code ?? 'GBP';
  const activeTotal = activeCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, displayCode, rates), 0);
  const balanceFormatted = `${activeTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${displayCode}`;
  const accountLabel = isJar ? t(jarConfig.nameKey) : isGroup ? t('home.taxes') : t('home.currentAccount');

  const menuItems = isJar
    ? [{ label: t('currentAccount.editJar'), icon: <Edit size={24} /> }, { label: t('common.statementsAndReports'), icon: <Document size={24} /> }, { label: t('currentAccount.closeJar'), icon: <CrossCircle size={24} /> }]
    : isGroup
      ? [{ label: t('currentAccount.editGroup'), icon: <Edit size={24} /> }, { label: t('common.statementsAndReports'), icon: <Document size={24} /> }, { label: t('currentAccount.closeGroup'), icon: <CrossCircle size={24} /> }]
      : [{ label: t('currentAccount.editCurrentAccount'), icon: <Edit size={24} /> }, { label: t('common.statementsAndReports'), icon: <Document size={24} /> }];

  const headerType = isJar ? 'jar' as const : isGroup ? 'group' as const : 'account' as const;
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
        onAccountDetailsClick={isJar ? undefined : onAccountDetails}
        accountType={accountType}
        jarColor={isJar ? jarConfig.color : undefined}
        jarIcon={jarIcon}
        hideGetPaid={isJar}
        onAdd={onAdd}
        onConvert={onConvert}
        onSend={onSend}
        onRequest={isJar ? undefined : onRequest}
        onPaymentLink={isJar ? undefined : onPaymentLink}
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

        {activeTab === 'currencies' && <CurrenciesSection onNavigateCurrency={onNavigateCurrency} activeCurrencies={activeCurrencies} isGroup={isGroup && !isJar} />}
        {activeTab === 'transactions' && <TransactionsSection activeTransactions={activeTransactions} />}
        {activeTab === 'options' && !isJar && <SidebarContent onNavigateCards={onNavigateCards} accountType={accountType} group={group} accountLabel={accountLabel} personalAvatarUrl={personalAvatarUrl} cardCount={cardCount} />}
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
