import { useState, useMemo } from 'react';
import { ListItem, Button, IconButton, Modal } from '@transferwise/components';
import { Graph, Money, Rewards, QuestionMarkCircle } from '@transferwise/icons';
import type { AccountType } from '@shared/data/account-registry';
import { useActiveCurrencies, useActiveTransactions, useActiveJars } from '../hooks/useDatasetData';
import { useAllCurrencies, useAllTransactions } from '../hooks/useAccountRegistry';
import { computeTotalBalance } from '@shared/data/balances';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useDataset } from '../context/Dataset';
import { useLanguage, useTxLabels } from '../context/Language';
import type { TranslationKey } from '../translations/en';
import { convertToHomeCurrency, getCurrencySymbol, usdBaseRates } from '@shared/data/currency-rates';
import './Insights.css';

export function Insights({ accountType = 'personal' }: { accountType?: AccountType }) {
  const { consumerName, businessName, consumerHomeCurrency, businessHomeCurrency } = usePrototypeNames();
  const { t } = useLanguage();
  const txLabels = useTxLabels();
  const { dataset } = useDataset();
  const rates = usdBaseRates;
  const isBusiness = accountType === 'business';
  const homeCurrency = isBusiness ? businessHomeCurrency : consumerHomeCurrency;
  const currentCurrencies = useActiveCurrencies(accountType);
  const currentTransactions = useActiveTransactions(accountType, consumerName, businessName, txLabels);
  const activeJars = useActiveJars(accountType);
  const subAccountCurrencies = useAllCurrencies(accountType);
  const subAccountTransactions = useAllTransactions(accountType);
  const activeCurrencies = [...currentCurrencies, ...subAccountCurrencies];
  const activeTransactions = [...currentTransactions, ...subAccountTransactions];

  const jarBalance = activeJars.reduce((sum, jar) => sum + jar.currencies.reduce((s, c) => s + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0), 0);

  const { totalBalance, cashBalance, interestBalance, hasStocks, stocksBalance, totalInterestReturns, totalStocksReturns, spentThisMonth, spentLastMonth, products } = useMemo(() => {
    const total = computeTotalBalance(accountType, homeCurrency, rates, dataset);

    // Separate currencies by mode: interest-only, stocks, and plain cash
    const interestOnlyCurrencies = activeCurrencies.filter((c) => c.hasInterest && !c.hasStocks);
    const stocksCurrencies = activeCurrencies.filter((c) => c.hasStocks);
    const cashCurrencies = activeCurrencies.filter((c) => !c.hasStocks && !c.hasInterest);
    const hasAnyAssets = interestOnlyCurrencies.length > 0 || stocksCurrencies.length > 0;
    const hasAnyStocks = stocksCurrencies.length > 0;
    const interestInHome = interestOnlyCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0);
    const stocksInHome = stocksCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0);
    const cashInHome = cashCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, homeCurrency, rates), 0) + jarBalance;


    const stocks = hasAnyStocks
      ? stocksCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance * 0.05, c.code, homeCurrency, rates), 0)
      : 0;

    // Interest returns from Wise Interest transactions — use fallback rates (historical, not live)
    const interestTxs = activeTransactions.filter((tx) => tx.name === 'Wise Interest' && tx.isPositive);
    const interestReturns = interestTxs.reduce((sum, tx) => {
      const match = tx.amount.match(/([\d.]+)\s*(\w+)/);
      if (!match) return sum;
      const amt = parseFloat(match[1]);
      const cur = match[2];
      return sum + convertToHomeCurrency(amt, cur, homeCurrency, usdBaseRates);
    }, 0);

    // Stocks returns from currency totalReturns field (no transactions for actively invested funds)
    const stocksReturns = stocksCurrencies.reduce((sum, c) => {
      if (!c.totalReturns) return sum;
      const match = c.totalReturns.match(/([+-]?[\d.]+)\s*(\w+)/);
      if (!match) return sum;
      const amt = parseFloat(match[1]);
      return sum + convertToHomeCurrency(amt, c.code, homeCurrency, usdBaseRates);
    }, 0);

    // Spending: debit transactions (not conversions, not interest adds) — use fallback rates (historical)
    // "This month" / "Last month" derived from the current date
    const now = new Date();
    const currentMonth = now.toLocaleString('en-GB', { month: 'long' });
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = prevDate.toLocaleString('en-GB', { month: 'long' });
    const isCurrentMonth = (date: string) => date === 'Today' || date === 'Yesterday' || date.endsWith(currentMonth);
    const isLastMonth = (date: string) => date.endsWith(lastMonth);
    const debits = activeTransactions.filter((tx) => !tx.isPositive && !tx.conversion);
    const sumDebits = (filter: (date: string) => boolean) =>
      debits.filter((tx) => filter(tx.date)).reduce((sum, tx) => {
        const match = tx.amount.match(/([\d,.]+)\s*(\w+)/);
        if (!match) return sum;
        const amt = parseFloat(match[1].replace(/,/g, ''));
        const cur = match[2];
        return sum + convertToHomeCurrency(amt, cur, homeCurrency, usdBaseRates);
      }, 0);
    const spent = sumDebits(isCurrentMonth);
    const spentLast = sumDebits(isLastMonth);

    const prods: { key: string; titleKey: TranslationKey; subtitle: string | undefined; icon: React.ReactNode; control: 'navigation' | 'button'; value: number }[] = [
      {
        key: 'cash',
        titleKey: 'insights.cash' as TranslationKey,
        subtitle: `${(hasAnyAssets ? cashInHome : total).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${homeCurrency}`,
        icon: <Money size={24} />,
        control: 'navigation' as const,
        value: hasAnyAssets ? cashInHome : total,
      },
      // Interest: show with balance if currencies have hasInterest (not hasStocks)
      interestOnlyCurrencies.length > 0 ? {
        key: 'interest',
        titleKey: 'insights.interest' as TranslationKey,
        subtitle: `${interestInHome.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${homeCurrency}`,
        icon: <Rewards size={24} />,
        control: 'navigation' as const,
        value: interestInHome,
      } : {
        key: 'interest',
        titleKey: 'insights.interest' as TranslationKey,
        subtitle: undefined as string | undefined,
        icon: <Rewards size={24} />,
        control: 'button' as const,
        value: 0,
      },
      // Stocks: show with balance if currencies have hasStocks
      hasAnyStocks ? {
        key: 'stocks',
        titleKey: 'insights.stocks' as TranslationKey,
        subtitle: `${stocksInHome.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${homeCurrency}`,
        icon: <Graph size={24} />,
        control: 'navigation' as const,
        value: stocksInHome,
      } : {
        key: 'stocks',
        titleKey: 'insights.stocks' as TranslationKey,
        subtitle: undefined as string | undefined,
        icon: <Graph size={24} />,
        control: 'button' as const,
        value: -1,
      },
    ].sort((a, b) => b.value - a.value);

    return {
      totalBalance: total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      cashBalance: cashInHome,
      interestBalance: interestInHome,
      hasStocks: hasAnyStocks,
      stocksBalance: stocks,
      totalInterestReturns: interestReturns,
      totalStocksReturns: stocksReturns,
      spentThisMonth: spent,
      spentLastMonth: spentLast,
      products: prods,
    };
  }, [activeCurrencies, activeTransactions, homeCurrency, rates, jarBalance, accountType]);
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false);

  return (
    <div className="insights-page">
      {/* Total Balance */}
      <div className="insights-page__balance">
        <div className="insights-page__balance-label">
          <span className="np-text-body-large" style={{ margin: 0 }}>{t('insights.totalBalance')}</span>
          <IconButton
            size={24}
            priority="minimal"
            aria-label={t('balance.balanceInfo')}
            onClick={() => setIsBalanceInfoOpen(true)}
          >
            <QuestionMarkCircle size={16} />
          </IconButton>
        </div>
        <h1 className="np-text-display-number" style={{ margin: 0 }}>{totalBalance} {homeCurrency}</h1>
      </div>

      {/* Balance Info Modal */}
      <Modal
        open={isBalanceInfoOpen}
        onClose={() => setIsBalanceInfoOpen(false)}
        title={t('insights.totalBalance')}
        body={
          <>
            <p className="np-text-body-large" style={{ margin: 0 }}>
              {t('balance.insightsModalBody1')}
            </p>
            <p className="np-text-body-large" style={{ margin: 0 }}>
              {t('balance.insightsModalBody2')}
            </p>
          </>
        }
      />

      {/* Product List */}
      <div className="insights-page__products">
        {products.map((product) => (
          <ListItem
            key={product.key}
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t(product.titleKey)}</span>}
            subtitle={product.subtitle}
            media={
              <ListItem.AvatarView
                size={48}
                style={
                  product.key === 'interest'
                    ? { backgroundColor: 'var(--color-forest-green)', color: 'var(--color-sage-green)' }
                    : product.key === 'stocks'
                      ? { backgroundColor: 'var(--color-sage-green)', color: 'var(--color-forest-green)' }
                      : { backgroundColor: 'var(--color-background-neutral)' }
                }
              >
                {product.icon}
              </ListItem.AvatarView>
            }
            control={
              product.control === 'navigation'
                ? <ListItem.Navigation onClick={() => {}} />
                : <ListItem.Button priority="secondary-neutral" onClick={() => {}}>{t('common.learnMore')}</ListItem.Button>
            }
          />
        ))}
      </div>

      {/* Total Returns */}
      <div className="insights-page__returns">
        <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('insights.totalReturns')}</h3>
        <div className="insights-page__returns-card">
          <div>
            <p className="np-text-body-default" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>{t('insights.interest')}</p>
            <p className="np-text-title-subsection" style={{ margin: '4px 0 0', color: totalInterestReturns > 0 ? 'var(--color-sentiment-positive)' : undefined }}>
              {totalInterestReturns > 0 ? '+ ' : ''}{totalInterestReturns.toFixed(2)} {homeCurrency}
            </p>
          </div>
          <div>
            <p className="np-text-body-default" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>{t('insights.stocks')}</p>
            <p className="np-text-title-subsection" style={{ margin: '4px 0 0', color: totalStocksReturns > 0 ? 'var(--color-sentiment-positive)' : undefined }}>
              {totalStocksReturns > 0 ? '+ ' : ''}{totalStocksReturns.toFixed(2)} {homeCurrency}
            </p>
          </div>
        </div>
      </div>

      {/* Spending — personal only */}
      {!isBusiness && (
        <div className="insights-page__spending">
          <div className="insights-page__spending-card">
            <div className="insights-page__spending-header">
              <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('insights.spending')}</h3>
              <Button v2 size="sm" priority="tertiary" onClick={() => {}}>{t('common.seeAll')}</Button>
            </div>
            <ListItem
              title={`${spentThisMonth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${homeCurrency}`}
              subtitle={t('insights.spentThisMonth')}
              media={
                <ListItem.AvatarView size={48}>
                  <Money size={24} />
                </ListItem.AvatarView>
              }
            />
            <ListItem
              title={`${spentLastMonth.toFixed(2)} ${homeCurrency}`}
              subtitle={t('insights.spentLastMonth')}
              media={
                <ListItem.AvatarView size={48}>
                  <Money size={24} />
                </ListItem.AvatarView>
              }
            />
          </div>
        </div>
      )}

      {/* Feedback Footer */}
      <div className="insights-page__footer">
        <p className="np-text-body-default" style={{ color: 'var(--color-content-secondary)', margin: 0 }}>
          {t('insights.feedbackQuestion')}
        </p>
        <a
          href="#"
          className="np-text-link-default"
          onClick={(e) => e.preventDefault()}
        >
          {t('common.giveFeedback')}
        </a>
      </div>
    </div>
  );
}
