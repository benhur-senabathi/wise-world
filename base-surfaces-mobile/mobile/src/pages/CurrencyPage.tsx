import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { UpwardGraph, AutoConvert, Link as LinkIcon, ChevronRight, QuestionMarkCircle, Savings, Suitcase, Documents, DirectDebits, Bank, Bin, Money, People, Heart, Backpack } from '@transferwise/icons';
import { Button, ListItem } from '@transferwise/components';
import { LiquidGlassSegmentedControl } from '../components/LiquidGlassSegmentedControl';
import type { AccountType } from '../App';
import { AccountPageHeader } from '../components/AccountPageHeader';
import { ActivitySummary } from '../components/ActivitySummary';
import { type CurrencyData } from '@shared/data/currencies';
import { formatBalance } from '@shared/data/balances';
import { getTransactionsForCurrency, groupByDate, type Transaction } from '@shared/data/transactions';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, useTxLabels } from '../context/Language';
import { useActiveCurrencies, useActiveTransactions } from '../hooks/useDatasetData';

import type { JarDefinition } from '@shared/data/jar-data';
import { getAccountBySubPageType } from '@shared/data/account-registry';

type Props = {
  code: string;
  onNavigateAccount?: () => void;
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
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Money: <Money size={16} />,
  People: <People size={16} />,
  Heart: <Heart size={16} />,
  Backpack: <Backpack size={16} />,
};

function TransactionsSection({ currency, txList }: { currency: CurrencyData; txList?: Transaction[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const allTx = getTransactionsForCurrency(currency.code, txList, t('tx.movedByYou'));
  const isSearching = search.length >= 3;
  const filtered = isSearching
    ? allTx.filter((tx) => tx.name.toLowerCase().includes(search.toLowerCase()))
    : allTx;
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
      {allTx.length === 0 && (
        <div className="section-card__empty">
          <h3 className="section-card__title" style={{ margin: '0 0 8px' }}>{t('currencyPage.nothingYet')}</h3>
          <p className="np-text-body-default" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>{t('currencyPage.txWillShow')}</p>
        </div>
      )}

      {isSearching && grouped.length === 0 && allTx.length > 0 && (
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

function InterestListItem({ currency, accountType = 'personal', isJar = false }: { currency: CurrencyData; accountType?: AccountType; isJar?: boolean }) {
  const { t } = useLanguage();
  const isStocks = currency.hasStocks;
  const isActive = !isJar && (isStocks || currency.hasInterest);
  return (
    <ListItem
      spotlight={isActive ? 'active' : 'inactive'}
      title={isStocks ? t('currencyPage.stocksActive') : isActive ? t('currencyPage.interestActive') : t('currencyPage.earnReturn')}
      subtitle={isStocks ? t('currencyPage.stocksIndex') : isActive ? t('currencyPage.variableRate') : t('currencyPage.exploreGrow')}
      media={
        <ListItem.AvatarView size={48} style={isActive
          ? { backgroundColor: 'var(--color-interactive-accent)', border: 'none', color: 'var(--color-forest-green)' }
          : { backgroundColor: 'var(--color-background-neutral)', border: 'none' }
        }>
          <UpwardGraph size={24} />
        </ListItem.AvatarView>
      }
      control={<ListItem.Navigation onClick={() => {}} />}
    />
  );
}

function InterestRateCard({ currency, interestReturns }: { currency: CurrencyData; interestReturns?: number }) {
  const { t } = useLanguage();
  const isStocks = currency.hasStocks;
  const rate = currency.interestRate ?? '3.26%';
  const returnsValue = interestReturns ?? 0;
  const returns = returnsValue > 0
    ? `+${returnsValue.toFixed(2)} ${currency.code}`
    : `${returnsValue.toFixed(2)} ${currency.code}`;
  const isPositiveReturn = returnsValue > 0;
  const isNegativeReturn = returnsValue < 0;
  const returnColor = isPositiveReturn
    ? 'var(--color-sentiment-positive)'
    : isNegativeReturn
      ? 'var(--color-sentiment-negative)'
      : undefined;

  if (isStocks) {
    const availableBalance = (currency.balance * 0.95).toFixed(2);
    const totalReturns = currency.totalReturns ?? `${returnsValue.toFixed(2)} ${currency.code}`;
    const totalReturnsColor = totalReturns.startsWith('+') ? 'var(--color-sentiment-positive)' : undefined;
    return (
      <div className="interest-rate-card">
        <button type="button" className="interest-rate-card__cell interest-rate-card__cell--clickable">
          <span className="interest-rate-card__value">
            {availableBalance} {currency.code}
            <span className="interest-rate-card__chevron" style={{ color: 'var(--color-content-secondary)', display: 'inline-flex', alignItems: 'center' }}><QuestionMarkCircle size={16} /></span>
          </span>
          <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{t('currencyPage.availableLabel')}</span>
        </button>
        <div className="interest-rate-card__divider" />
        <button type="button" className="interest-rate-card__cell interest-rate-card__cell--clickable">
          <span className="interest-rate-card__value" style={totalReturnsColor ? { color: totalReturnsColor } : undefined}>
            {totalReturns}
            <span className="interest-rate-card__chevron"><ChevronRight size={16} /></span>
          </span>
          <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{t('currencyPage.totalReturnsLabel')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="interest-rate-card">
      <div className="interest-rate-card__cell">
        <span className="interest-rate-card__value">{rate}</span>
        <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{t('currencyPage.variableRateLabel')}</span>
      </div>
      <div className="interest-rate-card__divider" />
      <button type="button" className="interest-rate-card__cell interest-rate-card__cell--clickable">
        <span className="interest-rate-card__value" style={returnColor ? { color: returnColor } : undefined}>
          {returns}
          <span className="interest-rate-card__chevron"><ChevronRight size={16} /></span>
        </span>
        <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{t('currencyPage.returnsThisMonth')}</span>
      </button>
    </div>
  );
}

function OptionsContent({ currency, accountType = 'personal', interestReturns, isJar = false }: { currency: CurrencyData; accountType?: AccountType; interestReturns?: number; isJar?: boolean }) {
  const { t } = useLanguage();
  const showRateCard = (currency.hasStocks || currency.hasInterest) && accountType === 'personal';

  return (
    <>
      {showRateCard && (
        <div className="currency-page__options-rate-card">
          <InterestRateCard currency={currency} interestReturns={interestReturns} />
          <p className="np-text-body-small currency-page__disclaimer" style={{ margin: '12px 0 20px', color: 'var(--color-content-secondary)', textAlign: 'center' }}>
            {t(currency.hasStocks ? 'currencyPage.disclaimerStocks' : 'currencyPage.disclaimerInterest')}
          </p>
        </div>
      )}
      <div className="currency-page__options-list">
        <InterestListItem currency={currency} accountType={accountType} isJar={isJar} />
      </div>
      {!showRateCard && (
        <p className="np-text-body-small currency-page__disclaimer" style={{ margin: '12px 0 8px', color: 'var(--color-content-secondary)', textAlign: 'center' }}>
          {t('currencyPage.disclaimer')}
        </p>
      )}
      <div className="currency-page__options-list" style={{ marginTop: 16 }}>
        <ListItem
          spotlight="inactive"
          title={t('currencyPage.autoConversions')}
          subtitle={t('currencyPage.autoConversionsSub')}
          media={
            <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
              <AutoConvert size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
      </div>
    </>
  );
}

function Sidebar({ currency, accountType = 'personal', interestReturns, isJar = false }: { currency: CurrencyData; accountType?: AccountType; interestReturns?: number; isJar?: boolean }) {
  const { t } = useLanguage();
  const showRateCard = (currency.hasStocks || currency.hasInterest) && accountType === 'personal';

  return (
    <aside className="currency-page__rate-card">
      {showRateCard && (
        <>
          <InterestRateCard currency={currency} interestReturns={interestReturns} />
          <p className="np-text-body-small currency-page__disclaimer" style={{ margin: '12px 0 20px', color: 'var(--color-content-secondary)', textAlign: 'center' }}>
            {t(currency.hasStocks ? 'currencyPage.disclaimerStocks' : 'currencyPage.disclaimerInterest')}
          </p>
        </>
      )}
      <InterestListItem currency={currency} accountType={accountType} isJar={isJar} />
      {!showRateCard && (
        <p className="np-text-body-small currency-page__disclaimer" style={{ margin: '12px 0 8px', color: 'var(--color-content-secondary)', textAlign: 'center' }}>
          {t('currencyPage.disclaimer')}
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <ListItem
          spotlight="inactive"
          title={t('currencyPage.autoConversions')}
          subtitle={t('currencyPage.autoConversionsSub')}
          media={
            <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
              <AutoConvert size={24} />
            </ListItem.AvatarView>
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
      </div>

      {accountType === 'business' && (
        <div style={{ marginTop: 16 }}>
          <ListItem
            spotlight="inactive"
            title={t('currencyPage.setupConnection')}
            subtitle={t('currencyPage.setupConnectionSub')}
            media={
              <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                <LinkIcon size={24} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        </div>
      )}
    </aside>
  );
}

export function CurrencyPage({ code, onNavigateAccount, onAccountDetails, accountType = 'personal', group, joint, youngExplorer, jarConfig, onAdd, onConvert, onSend, onRequest, onPaymentLink, moreMenuOpen, onMoreMenuClose }: Props) {
  const { t } = useLanguage();
  const txLabels = useTxLabels();
  const { consumerName, businessName } = usePrototypeNames();
  const [activeTab, setActiveTab] = useState('transactions');
  const datasetCurrencies = useActiveCurrencies(accountType);
  const datasetTransactions = useActiveTransactions(accountType, consumerName, businessName, txLabels);
  const isGroup = !!group;
  const isJar = !!jarConfig;
  const isJoint = !!joint;
  const isYoungExplorer = !!youngExplorer;

  const subPageType = isJar ? null : group === 'shared-spending' ? 'shared-spending-account' : isGroup ? 'group-account' : isJoint ? 'joint-account' : isYoungExplorer ? 'young-explorer-account' : 'account';
  const accountDef = subPageType && subPageType !== 'account' ? getAccountBySubPageType(subPageType) : undefined;
  const features = accountDef?.features;

  const activeCurrencies = isJar ? jarConfig.currencies : accountDef ? accountDef.getCurrencies() : datasetCurrencies;
  const activeTxList = isJar ? jarConfig.transactions : accountDef ? accountDef.getTransactions() : datasetTransactions;
  const currency = activeCurrencies.find((c) => c.code === code);

  const interestReturns = useMemo(() => {
    const interestTxs = activeTxList.filter((tx) => tx.name === 'Wise Interest' && tx.isPositive && tx.currency === currency?.code);
    return interestTxs.reduce((sum, tx) => {
      const match = tx.amount.match(/([\d.]+)/);
      return sum + (match ? parseFloat(match[1]) : 0);
    }, 0);
  }, [activeTxList, currency?.code]);

  if (!currency) {
    return <div className="np-text-body-default">Currency not found.</div>;
  }

  const showRateCard = (currency.hasStocks || currency.hasInterest) && accountType === 'personal';
  const jarIcon = isJar ? (jarConfig.iconName === 'Suitcase' ? <Suitcase size={16} /> : <Savings size={16} />) : undefined;

  const menuItems = isJar
    ? [{ label: t('common.statementsAndReports'), icon: <Documents size={24} /> }, { label: t('currencyPage.removeCurrency'), icon: <Bin size={24} /> }]
    : [
        { label: t('common.statementsAndReports'), icon: <Documents size={24} /> },
        { label: t('currencyPage.directDebits'), icon: <DirectDebits size={24} /> },
        { label: t('currencyPage.getProof'), icon: <Bank size={24} /> },
        { label: t('currencyPage.removeCurrency'), icon: <Bin size={24} /> },
      ];

  return (
    <div className="currency-page">
      <AccountPageHeader
        type="currency"
        currencyCode={currency.code}
        label={currency.code}
        balance={formatBalance(currency)}
        accountDetails={isJar ? undefined : features?.hasAccountDetails === false ? undefined : currency.accountDetails}
        menuItems={menuItems}
        moreMenuOpen={moreMenuOpen}
        onMoreMenuClose={onMoreMenuClose}
        onAccountDetailsClick={isJar ? undefined : features?.hasAccountDetails === false ? undefined : onAccountDetails}
        onBreadcrumbClick={onNavigateAccount}
        accountType={accountType}
        jarColor={isJar ? jarConfig.color : accountDef && accountDef.subPageType !== 'account' ? accountDef.style.color : undefined}
        jarTextColor={accountDef && accountDef.subPageType !== 'account' ? accountDef.style.textColor : undefined}
        jarName={isJar ? t(jarConfig.nameKey) : accountDef && accountDef.subPageType !== 'account' ? t(accountDef.nameKey) : undefined}
        jarIcon={jarIcon ? jarIcon : accountDef && accountDef.subPageType !== 'account' ? ICON_MAP[accountDef.style.iconName] || null : undefined}
        hideGetPaid={isJar || (features ? !features.hasRequest : false)}
        sendSecondary={currency.balance === 0}
        moveOnly={features?.moveOnly}
        onAdd={onAdd}
        onConvert={features?.hasConvert === false ? undefined : onConvert}
        onSend={features?.hasSend === false ? undefined : onSend}
        onRequest={isJar || features?.hasRequest === false ? undefined : onRequest}
        onPaymentLink={isJar || features?.hasPaymentLink === false ? undefined : onPaymentLink}
      />

      <div>
        {showRateCard && (
          <div className="currency-page__mobile-rate-card">
            <InterestRateCard currency={currency} interestReturns={interestReturns} />
            <p className="np-text-body-small currency-page__disclaimer" style={{ margin: '12px 0 0', color: 'var(--color-content-secondary)', textAlign: 'center' }}>
              {t(currency.hasStocks ? 'currencyPage.disclaimerStocks' : 'currencyPage.disclaimerInterest')}
            </p>
          </div>
        )}
        <div className="currency-page__tabs">
          <LiquidGlassSegmentedControl
            name="currency-tabs"
            segments={[
              { id: 'ctab-transactions', value: 'transactions', label: t('currencyPage.tab.transactions') },
              { id: 'ctab-options', value: 'options', label: t('currencyPage.tab.options') },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {activeTab === 'transactions' && <TransactionsSection currency={currency} txList={activeTxList} />}
        {activeTab === 'options' && <OptionsContent currency={currency} accountType={accountType} interestReturns={interestReturns} isJar={isJar} />}
      </div>
    </div>
  );
}
