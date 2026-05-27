import { useState } from 'react';
import { Download, Slider, Plus, Money, Savings, Suitcase, Upload, People, Heart, Backpack } from '@transferwise/icons';
import { Button, ListItem, SearchInput, Size, SegmentedControl, AvatarLayout } from '@transferwise/components';
import { Flag } from '@wise/art';
import type { AccountType } from '../App';
import { AccountPageHeader } from '../components/AccountPageHeader';
import { ActivitySummary } from '../components/ActivitySummary';
import { useActiveCurrencies, useActiveTransactions } from '../hooks/useDatasetData';
import { getAccountBySubPageType, useAllCards, type AccountDefinition } from '../hooks/useAccountRegistry';
import { groupByDate, type Transaction } from '@shared/data/transactions';
import type { CurrencyData } from '@shared/data/currencies';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, useTxLabels } from '../context/Language';
import { convertToHomeCurrency, usdBaseRates } from '@shared/data/currency-rates';

import type { JarDefinition } from '@shared/data/jar-data';

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
  personalAvatarUrl?: string;
};

function CurrenciesSection({ onNavigateCurrency, isMobile, activeCurrencies, isGroup, hideAddCurrency, hideInterest }: { onNavigateCurrency?: (code: string) => void; isMobile?: boolean; activeCurrencies: CurrencyData[]; isGroup?: boolean; hideAddCurrency?: boolean; hideInterest?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="section-card">
      {!isMobile && (
        <div className="section-card__header">
          <h3 className="section-card__title" style={{ margin: 0 }}>{t('currentAccount.currencies')}</h3>
          {!hideAddCurrency && <Button v2 size="sm" priority="secondary-neutral">{t('currentAccount.addCurrency')}</Button>}
        </div>
      )}
      <ul className="wds-list list-unstyled m-y-0">
        {isMobile && !hideAddCurrency && (
          <ListItem
            title={t('currentAccount.addCurrency')}
            media={
              <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                <Plus size={24} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        )}
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

function TransactionsSection({ isMobile, activeTransactions }: { isMobile?: boolean; activeTransactions: Transaction[] }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const isSearching = search.length >= 3;
  const filtered = isSearching
    ? activeTransactions.filter((tx) => tx.name.toLowerCase().includes(search.toLowerCase()))
    : activeTransactions;
  const grouped = groupByDate(filtered);

  return (
    <div className="section-card">
      {!isMobile && (
        <div className="section-card__header">
          <h3 className="section-card__title" style={{ margin: 0 }}>{t('home.transactions')}</h3>
        </div>
      )}

      {activeTransactions.length === 0 && (
        <div className="section-card__empty">
          <h3 className="section-card__title" style={{ margin: '0 0 8px' }}>{t('currencyPage.nothingYet')}</h3>
          <p className="np-text-body-default" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>{t('currencyPage.txWillShow')}</p>
        </div>
      )}

      {activeTransactions.length > 0 && (
        <div className="account-tab-panel__tx-header">
          <div className="account-tab-panel__tx-search">
            <SearchInput
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size={Size.SMALL}
            />
          </div>
          <Button v2 size="sm" priority="secondary-neutral" addonStart={{ type: 'icon', value: <Slider size={16} /> }}>{t('common.filters')}</Button>
          <Button v2 size="sm" priority="secondary-neutral" addonStart={{ type: 'icon', value: <Download size={16} /> }}>{t('common.download')}</Button>
        </div>
      )}

      {isSearching && grouped.length === 0 && activeTransactions.length > 0 && (
        <p className="np-text-body-default" style={{ margin: '24px 0', fontWeight: 600, color: 'var(--color-content-primary)' }}>{t('transactions.noResults')}</p>
      )}

      {grouped.map(([date, txs]) => (
        <div className="np-section" key={date}>
          <h5 className="np-text-title-group np-header np-header--group p-y-2" style={{ margin: 0 }}>
            {date}
          </h5>
          <ul className="wds-list list-unstyled m-y-0 transactions-list">
            {txs.map((tx, i) => (
              <ActivitySummary
                key={i}
                icon={tx.icon}
                imgSrc={tx.imgSrc}
                name={tx.name}
                subtitle={tx.subtitle}
                amount={tx.amount}
                amountSub={tx.amountSub}
                isPositive={tx.isPositive}
              />
            ))}
          </ul>
        </div>
      ))}
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

function CardThumbnail({ image }: { image?: string }) {
  const src = image ? (mediumCardMap[image] || image) : undefined;
  if (src) {
    return (
      <div className="card-thumbnail">
        <img src={src} alt="" className="card-thumbnail__img" />
      </div>
    );
  }
  return (
    <div className="card-thumbnail card-thumbnail--physical">
      <div className="card-thumbnail__light" />
      <div className="card-thumbnail__shadow" />
    </div>
  );
}

function SpendCardMedia({ accountType = 'personal', accountDef, cardCount }: { accountType?: AccountType; accountDef?: AccountDefinition; cardCount?: number }) {
  const allCards = accountDef?.getCards(accountType) ?? [];
  const cards = cardCount !== undefined ? allCards.slice(0, cardCount) : allCards;

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
      <CardThumbnail />
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
  const name = accountLabel ?? '';
  const hasParticipants = accountDef?.features.hasParticipants ?? (isGroup || isJoint || isYoungExplorer);
  const isTeamStyle = accountDef?.features.participantStyle === 'team';
  const participant = accountDef?.participants[0];
  return (
    <>
      {hasCards && cardCount > 0 && (
        <ListItem
          spotlight="active"
          title={isBusiness ? t('cards.title') : t('currentAccount.spend')}
          subtitle={t('currentAccount.cardsInAccount', { count: cardCount, name })}
          media={<SpendCardMedia accountType={accountType} accountDef={accountDef} cardCount={cardCount} />}
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

export function AccountPage({ onNavigateCurrency, onNavigateCards, onAccountDetails, accountType = 'personal', group, joint, youngExplorer, jarConfig, onAdd, onConvert, onSend, onRequest, onPaymentLink, personalAvatarUrl }: Props) {
  const { consumerName, businessName } = usePrototypeNames();
  const { t } = useLanguage();
  const txLabels = useTxLabels();
  const [activeTab, setActiveTab] = useState('currencies');

  const datasetCurrencies = useActiveCurrencies(accountType);
  const datasetTransactions = useActiveTransactions(accountType, consumerName, businessName, txLabels);
  const rates = usdBaseRates;
  const isGroup = !!group;
  const isJoint = !!joint;
  const isYoungExplorer = !!youngExplorer;
  const isJar = !!jarConfig;

  const subPageType = group === 'shared-spending' ? 'shared-spending-account' : isGroup ? 'group-account' : isJoint ? 'joint-account' : isYoungExplorer ? 'young-explorer-account' : 'account';
  const accountDef = isJar ? undefined : getAccountBySubPageType(subPageType);
  const isCurrentAccount = accountDef?.subPageType === 'account';
  const activeCurrencies = isJar ? jarConfig.currencies : (accountDef && !isCurrentAccount) ? accountDef.getCurrencies() : datasetCurrencies;
  const activeTransactions = isJar ? jarConfig.transactions : (accountDef && !isCurrentAccount) ? accountDef.getTransactions() : datasetTransactions;
  const displayCode = activeCurrencies[0]?.code ?? 'GBP';
  const activeTotal = activeCurrencies.reduce((sum, c) => sum + convertToHomeCurrency(c.balance, c.code, displayCode, rates), 0);
  const balanceFormatted = `${activeTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${displayCode}`;
  const accountLabel = isJar ? t(jarConfig.nameKey as any) : accountDef ? t(accountDef.nameKey as any) : t('home.currentAccount');
  const features = accountDef?.features;
  const allDatasetCards = useAllCards(accountType);
  const cardCount = isJar ? 0 : isCurrentAccount
    ? allDatasetCards.filter((c) => c.accountNameKey === 'home.currentAccount').length
    : accountDef ? accountDef.getCards(accountType).length : 0;

  const menuItems = isJar
    ? [{ label: t('currentAccount.editJar') }, { label: t('common.statementsAndReports') }, { label: t('currentAccount.closeJar') }]
    : accountDef
      ? accountDef.menuItemKeys.map((key) => ({ label: t(key as any) }))
      : [{ label: t('currentAccount.editCurrentAccount') }, { label: t('common.statementsAndReports') }];

  const headerType = isJar ? 'jar' as const : (isGroup || isJoint || isYoungExplorer) ? 'group' as const : 'account' as const;
  const headerJarColor = isJar ? jarConfig.color : accountDef && accountDef.subPageType !== 'account' ? accountDef.style.color : undefined;
  const headerJarTextColor = accountDef && accountDef.subPageType !== 'account' ? accountDef.style.textColor : undefined;
  const jarIcon = isJar ? (jarConfig.iconName === 'Suitcase' ? <Suitcase size={16} /> : <Savings size={16} />) : undefined;

  return (
    <div className="current-account">
      <AccountPageHeader
        type={headerType}
        label={accountLabel}
        balance={balanceFormatted}
        menuItems={menuItems}
        onAccountDetailsClick={isJar ? undefined : features?.hasAccountDetails === false ? undefined : onAccountDetails}
        accountType={accountType}
        jarColor={headerJarColor}
        jarTextColor={headerJarTextColor}
        jarIcon={jarIcon ? jarIcon : accountDef && accountDef.subPageType !== 'account' ? <AccountIcon iconName={accountDef.style.iconName} /> : undefined}
        hideGetPaid={isJar || (features ? !features.hasRequest : false)}
        moveOnly={features?.moveOnly}
        onAdd={onAdd}
        onConvert={features?.hasConvert === false ? undefined : onConvert}
        onSend={features?.hasSend === false ? undefined : onSend}
        onRequest={isJar || features?.hasRequest === false ? undefined : onRequest}
        onPaymentLink={isJar || features?.hasPaymentLink === false ? undefined : onPaymentLink}
      />

      {/* Desktop: two-column layout (60/40) */}
      {isJar ? (
        <div className="current-account__desktop">
          <div className="current-account__desktop-main">
            <CurrenciesSection onNavigateCurrency={onNavigateCurrency} activeCurrencies={activeCurrencies} isGroup={false} />
            <TransactionsSection activeTransactions={activeTransactions} />
          </div>
          <aside className="current-account__desktop-sidebar">
            {accountType === 'personal' && (
              <ListItem
                spotlight="inactive"
                title={t('currentAccount.setSavingsGoal')}
                subtitle={t('currentAccount.savingsGoalSub')}
                media={<div className="savings-goal-circle" />}
                control={<ListItem.Navigation onClick={() => {}} />}
              />
            )}
            <p className="np-text-body-default" style={{ margin: '16px 0 0', textAlign: 'center', color: 'var(--color-content-secondary)' }}>
              {t('currentAccount.changesFooter')}
            </p>
            <p className="np-text-body-default" style={{ margin: '4px 0 0', textAlign: 'center' }}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--color-content-link)', fontWeight: 600, textDecoration: 'underline' }}>{t('common.giveFeedback')}</a>
            </p>
          </aside>
        </div>
      ) : (
        <div className="current-account__desktop">
          <div className="current-account__desktop-main">
            <CurrenciesSection onNavigateCurrency={onNavigateCurrency} activeCurrencies={activeCurrencies} isGroup={isGroup} hideAddCurrency={features?.hideAddCurrency} hideInterest={features?.singleCurrency} />
            <TransactionsSection activeTransactions={activeTransactions} />
          </div>
          <aside className="current-account__desktop-sidebar">
            <SidebarContent onNavigateCards={onNavigateCards} accountType={accountType} group={group} joint={isJoint} youngExplorer={isYoungExplorer} accountLabel={accountLabel} personalAvatarUrl={personalAvatarUrl} cardCount={cardCount} hasCards={accountDef ? accountDef.features.hasCards : false} accountDef={accountDef} />
          </aside>
        </div>
      )}

      {/* Mobile/Tablet: segmented control tabs */}
      <div className="current-account__mobile">
        <div className="current-account__tabs">
          <SegmentedControl
            name="account-tabs"
            mode="input"
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

        {activeTab === 'currencies' && <CurrenciesSection onNavigateCurrency={onNavigateCurrency} isMobile activeCurrencies={activeCurrencies} isGroup={isGroup && !isJar} hideAddCurrency={features?.hideAddCurrency} hideInterest={features?.singleCurrency} />}
        {activeTab === 'transactions' && <TransactionsSection isMobile activeTransactions={activeTransactions} />}
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
