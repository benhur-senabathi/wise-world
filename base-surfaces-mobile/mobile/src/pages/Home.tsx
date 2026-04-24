import { useState, useMemo } from 'react';
import { Plus, RequestReceive, Send, Savings, Suitcase } from '@transferwise/icons';
import { Button } from '@transferwise/components';
import { Illustration } from '@wise/art';
import type { AccountType } from '../App';
import { currencies } from '@shared/data/currencies';
import { businessCurrencies } from '@shared/data/business-currencies';
import { buildTransactions } from '@shared/data/transactions';
import { buildBusinessTransactions } from '@shared/data/business-transactions';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, useTxLabels } from '../context/Language';
import { convertToHomeCurrency, usdBaseRates } from '@shared/data/currency-rates';
import type { TranslationKey } from '../translations/en';
import { TotalBalanceHeader } from '../components/TotalBalanceHeader';
import { ActionButtonRow } from '../components/ActionButtonRow';
import { Carousel } from '../components/Carousel';
import { MultiCurrencyAccountCard } from '../components/MultiCurrencyAccountCard';
import { EmptyAccountCard } from '../components/EmptyAccountCard';
import { JarCard } from '../components/JarCard';
import { savingsJar, suppliesJar } from '@shared/data/jar-data';
import { groupTotalBalance } from '@shared/data/taxes-data';
import { computeTotalBalance } from '@shared/data/balances';
import { TaskCard } from '../components/TaskCard';
import { TasksStack } from '../components/TasksStack';
import { ActivitySummary } from '../components/ActivitySummary';
import { SendAgainCard } from '../components/SendAgainCard';
import { PromotionBanner } from '../components/PromotionBanner';
import { TransferCalculator } from '../components/TransferCalculator';
import { PageFooter } from '../components/PageFooter';

function buildBalances(currencyList: typeof currencies) {
  return currencyList.map((c) => ({
    code: c.code,
    amount: `${c.symbol}${c.balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    value: c.balance,
  }));
}

type PromoVariant = {
  sectionTitleKey: TranslationKey;
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
  backgroundImage?: string;
  backgroundColor: string;
  illustrationName: 'multi-currency' | 'interest' | null;
  ctaLabelKey?: TranslationKey;
  disclaimerKey?: TranslationKey;
};

const allPromotionVariants: PromoVariant[] = [
  {
    sectionTitleKey: 'promo.youngExplorer.section',
    titleKey: 'promo.youngExplorer.title',
    subtitleKey: 'promo.youngExplorer.subtitle',
    backgroundImage: 'https://wise.com/public-resources/assets/launchpad/promotion/v3/young-explorer/v2/backpack.png',
    backgroundColor: 'var(--color-dark-purple)',
    illustrationName: null,
  },
  {
    sectionTitleKey: 'promo.largeTransfers.section',
    titleKey: 'promo.largeTransfers.title',
    backgroundColor: '#163300',
    illustrationName: 'multi-currency',
  },
  {
    sectionTitleKey: 'promo.explore.section',
    titleKey: 'promo.explore.title',
    subtitleKey: 'promo.explore.subtitle',
    backgroundColor: '#163300',
    illustrationName: 'interest',
    ctaLabelKey: 'common.learnMore',
    disclaimerKey: 'promo.explore.disclaimer',
  },
  {
    sectionTitleKey: 'promo.fifa.section',
    titleKey: 'promo.fifa.title',
    subtitleKey: 'promo.fifa.subtitle',
    backgroundImage: '/promo-fifa-bg.png',
    backgroundColor: '#1a3a2a',
    illustrationName: null,
  },
];

// Business: exclude Young Explorer
const businessPromotionVariants = allPromotionVariants.filter((p) => p.sectionTitleKey !== 'promo.youngExplorer.section' && p.sectionTitleKey !== 'promo.fifa.section');



const GROUP_BALANCE = groupTotalBalance;

type SendAgainRecipient = { name: string; subtitle: string; avatarUrl?: string; hasFastFlag: boolean; badgeFlagCode?: string };

export function Home({ onNavigate, onNavigateAccount, onNavigateCurrency, onNavigateGroupAccount, onNavigateGroupCurrency, onNavigateJarAccount, onNavigateJarCurrency, accountType = 'personal', balanceHidden, onToggleBalance, onAddMoney, onSend, onSendWithCurrency, onSendAgain, onRequest, onPaymentLink, onAccountDetails }: { onNavigate?: (page: string, push?: boolean) => void; onNavigateAccount?: () => void; onNavigateCurrency?: (code: string) => void; onNavigateGroupAccount?: () => void; onNavigateGroupCurrency?: (code: string) => void; onNavigateJarAccount?: (jarId: string) => void; onNavigateJarCurrency?: (jarId: string, code: string) => void; accountType?: AccountType; balanceHidden?: boolean; onToggleBalance?: () => void; onAddMoney?: () => void; onSend?: () => void; onSendWithCurrency?: (sourceCurrency: string, targetCurrency: string, sourceAmount?: string, targetAmount?: string) => void; onSendAgain?: (recipient: SendAgainRecipient, amount?: string) => void; onRequest?: () => void; onPaymentLink?: () => void; onAccountDetails?: () => void }) {
  const { consumerName, businessName, consumerHomeCurrency, businessHomeCurrency } = usePrototypeNames();
  const { t } = useLanguage();
  const txLabels = useTxLabels();
  const rates = usdBaseRates;
  const isBusiness = accountType === 'business';
  const homeCurrency = isBusiness ? businessHomeCurrency : consumerHomeCurrency;
  const activeCurrencies = isBusiness ? businessCurrencies : currencies;
  const personalTransactions = useMemo(() => buildTransactions(consumerName, businessName, txLabels), [consumerName, businessName, txLabels]);
  const businessTransactions = useMemo(() => buildBusinessTransactions(consumerName, txLabels), [consumerName, txLabels]);
  const activeTransactions = isBusiness ? businessTransactions : personalTransactions;
  const accountBalances = buildBalances(activeCurrencies);
  // Account card total: convert all currencies to the account's first/display currency
  const accountDisplayCode = activeCurrencies[0]?.code ?? 'GBP';
  const accountDisplaySymbol = activeCurrencies[0]?.symbol ?? '£';
  const currentAccountInDisplayCurrency = activeCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, accountDisplayCode, rates), 0);
  const currentAccountFormatted = currentAccountInDisplayCurrency.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // TotalBalanceHeader: single source of truth via computeTotalBalance (includes all accounts + jars + groups)
  const totalBalance = computeTotalBalance(accountType, homeCurrency, rates);
  const totalBalanceFormatted = totalBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSeeAllTransactions = () => {
    onNavigate?.('Transactions', true);
  };

  const [showSendAgain, setShowSendAgain] = useState(true);
  const [sendAgainDismissing, setSendAgainDismissing] = useState(false);
  const [showPromotion, setShowPromotion] = useState(true);
  const [promotionDismissing, setPromotionDismissing] = useState(false);
  const promotionVariants = accountType === 'business' ? businessPromotionVariants : allPromotionVariants;
  const [promoIndex] = useState(() => Math.floor(Math.random() * promotionVariants.length));
  const promo = promotionVariants[promoIndex];

  const handleDismissSendAgain = () => {
    setSendAgainDismissing(true);
    setTimeout(() => setShowSendAgain(false), 900);
  };

  const handleDismissPromotion = () => {
    setPromotionDismissing(true);
    setTimeout(() => setShowPromotion(false), 900);
  };

  return (
    <div className="home">
      {/* Total Balance + Actions — no padding */}
      <section className="section">
        <TotalBalanceHeader amount={totalBalanceFormatted} currency={homeCurrency} onInsightsClick={onNavigate ? () => onNavigate('Insights', true) : undefined} variant={accountType === 'business' ? 'business' : 'personal'} balanceHidden={balanceHidden} onToggleBalance={onToggleBalance} />
      </section>

      {/* Action Buttons */}
      <section className="section">
        <ActionButtonRow accountType={accountType} onAddMoney={onAddMoney} onSend={onSend} onRequest={onRequest} onPaymentLink={onPaymentLink} />
      </section>

      {/* Account Cards */}
      <section className="section">
        <Carousel>
          <MultiCurrencyAccountCard
            title={t('home.currentAccount')}
            totalAmount={`${accountDisplaySymbol}${currentAccountFormatted}`}
            currencyCount={activeCurrencies.length}
            balances={accountBalances}
            hasCards={true}
            cardCount={2}
            onNavigateCards={onNavigate ? () => onNavigate('Cards') : undefined}
            onNavigateAccount={onNavigateAccount}
            onNavigateCurrency={onNavigateCurrency}
            currencyData={activeCurrencies}
            businessCardStyle={accountType === 'business'}
            onAccountDetails={onAccountDetails}
            balanceHidden={balanceHidden}
          />
          {accountType === 'business' && (
            <MultiCurrencyAccountCard
              title={t('home.taxes')}
              totalAmount={`£${GROUP_BALANCE.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              currencyCount={1}
              balances={[{ code: 'GBP', amount: `£${GROUP_BALANCE.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }]}
              hasCards={true}
              cardCount={2}
              onNavigateCards={onNavigate ? () => onNavigate('Cards') : undefined}
              onNavigateAccount={onNavigateGroupAccount}
              onNavigateCurrency={onNavigateGroupCurrency}
              cardTopImage={new URL('../assets/card-tapestry-orange.jpg', import.meta.url).href}
              cardBottomImage={new URL('../assets/card-tapestry-green.jpg', import.meta.url).href}
              hideAccountDetails
              cardInfoLight
              currencyData={[]}
              balanceHidden={balanceHidden}
            />
          )}
          {(() => {
            const jar = isBusiness ? suppliesJar : savingsJar;
            const jarBalances = jar.currencies.map((c) => ({ code: c.code, amount: `${c.symbol}${c.balance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }));
            const jarTotal = jar.currencies.length >= 2
              ? `${jar.currencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, jar.currencies[0].code, rates), 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${jar.currencies[0].code}`
              : undefined;
            return (
              <JarCard
                name={t(jar.nameKey)}
                icon={isBusiness ? <Suitcase size={24} /> : <Savings size={24} />}
                color={jar.color}
                totalAmount={jarTotal}
                balances={jarBalances}
                onNavigateAccount={() => onNavigateJarAccount?.(jar.id)}
                onNavigateCurrency={(code) => onNavigateJarCurrency?.(jar.id, code)}
                balanceHidden={balanceHidden}
              />
            );
          })()}
          <EmptyAccountCard />
        </Carousel>
      </section>

      {/* Tasks */}
      <section className="section">
        <TasksStack>
          {[
            <TaskCard
              key="paused"
              icon={<Plus size={24} />}
              sentiment="warning"
              title={accountType === 'business' ? t('tasks.pausedBusiness') : t('tasks.pausedPersonal')}
              description={t('tasks.pausedDescription')}
              actionLabel={t('common.review')}
            />,
            <TaskCard
              key="requests"
              icon={accountType === 'business' ? <Send size={24} /> : <RequestReceive size={24} />}
              sentiment="warning"
              title={accountType === 'business' ? t('tasks.requestsBusiness') : t('tasks.requestsPersonal')}
              description={accountType === 'business' ? t('tasks.requestsDescBusiness') : t('tasks.requestsDescPersonal')}
              actionLabel={t('common.review')}
            />,
          ]}
        </TasksStack>
      </section>

      {/* Transactions */}
      <section className="section home__tx-section">
        <h1 className="np-text-title-screen home__tx-page-title" style={{ margin: 0 }}>{t('home.transactions')}</h1>
        <div className="section-header home__tx-section-header">
          <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('home.transactions')}</h3>
          <Button v2 size="sm" priority="tertiary" onClick={handleSeeAllTransactions}>{t('common.seeAll')}</Button>
        </div>
        <ul className={`wds-list list-unstyled m-y-0 transactions-list${isBusiness ? ' home__tx-list--business' : ''}`}>
          {activeTransactions.slice(0, 3).map((tx, i) => (
            <ActivitySummary
              key={i}
              icon={tx.icon}
              imgSrc={tx.imgSrc}
              name={tx.name}
              subtitle={tx.subtitle}
              amount={tx.amount}
              isPositive={tx.isPositive}
            />
          ))}
        </ul>
      </section>

      {/* Send Again */}
      {showSendAgain && (
        <section className={`section section--dismissible${sendAgainDismissing ? ' section--dismissing' : ''}`}>
          <div className="section-header">
            <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('home.sendAgain')}</h3>
          </div>
          {accountType === 'business' ? (
            <SendAgainCard
              name="Sarah Chen"
              handle="Wise account"
              amount="1,200.00 GBP"
              avatarUrl="https://www.tapback.co/api/avatar/sarah-chen.webp"
              showFastFlag
              onDismiss={handleDismissSendAgain}
              onRepeat={() => onSendAgain?.({ name: 'Sarah Chen', subtitle: 'Wise account', avatarUrl: 'https://www.tapback.co/api/avatar/sarah-chen.webp', hasFastFlag: true }, '1,200.00 GBP')}
              onEdit={() => onSendAgain?.({ name: 'Sarah Chen', subtitle: 'Wise account', avatarUrl: 'https://www.tapback.co/api/avatar/sarah-chen.webp', hasFastFlag: true })}
            />
          ) : (
            <SendAgainCard
              name="Christie Davis"
              handle="@christied25"
              amount="0.01 GBP"
              avatarUrl="https://www.tapback.co/api/avatar/christie-davis.webp"
              showFastFlag
              onDismiss={handleDismissSendAgain}
              onRepeat={() => onSendAgain?.({ name: 'Christie Davis', subtitle: '@christied25', avatarUrl: 'https://www.tapback.co/api/avatar/christie-davis.webp', hasFastFlag: true }, '0.01 GBP')}
              onEdit={() => onSendAgain?.({ name: 'Christie Davis', subtitle: '@christied25', avatarUrl: 'https://www.tapback.co/api/avatar/christie-davis.webp', hasFastFlag: true })}
            />
          )}
        </section>
      )}

      {/* Promotion Banner — before calculator for personal */}
      {accountType !== 'business' && showPromotion && (
        <section className={`section section--dismissible${promotionDismissing ? ' section--dismissing' : ''}`}>
          <div className="section-header">
            <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t(promo.sectionTitleKey)}</h3>
          </div>
          <PromotionBanner
            title={t(promo.titleKey)}
            subtitle={promo.subtitleKey ? t(promo.subtitleKey) : undefined}
            backgroundImage={promo.backgroundImage}
            backgroundColor={promo.backgroundColor}
            illustration={promo.illustrationName ? <Illustration name={promo.illustrationName} size="large" /> : undefined}
            ctaLabel={promo.ctaLabelKey ? t(promo.ctaLabelKey) : undefined}
            disclaimer={promo.disclaimerKey ? t(promo.disclaimerKey) : undefined}
            onDismiss={handleDismissPromotion}
          />
        </section>
      )}

      {/* Transfer Calculator */}
      <section className="section">
        <div className="section-header">
          <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('home.transferCalculator')}</h3>
        </div>
        <TransferCalculator onSend={onSendWithCurrency ?? ((src: string, _tgt: string) => onSend?.())} />
      </section>

      {/* Promotion Banner — after calculator for business */}
      {accountType === 'business' && showPromotion && (
        <section className={`section section--dismissible${promotionDismissing ? ' section--dismissing' : ''}`}>
          <div className="section-header">
            <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t(promo.sectionTitleKey)}</h3>
          </div>
          <PromotionBanner
            title={t(promo.titleKey)}
            subtitle={promo.subtitleKey ? t(promo.subtitleKey) : undefined}
            backgroundImage={promo.backgroundImage}
            backgroundColor={promo.backgroundColor}
            illustration={promo.illustrationName ? <Illustration name={promo.illustrationName} size="large" /> : undefined}
            ctaLabel={promo.ctaLabelKey ? t(promo.ctaLabelKey) : undefined}
            disclaimer={promo.disclaimerKey ? t(promo.disclaimerKey) : undefined}
            onDismiss={handleDismissPromotion}
          />
        </section>
      )}

      {/* Footer */}
      <section className="section">
        <PageFooter />
      </section>
    </div>
  );
}
