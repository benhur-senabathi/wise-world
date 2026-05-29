import { useState, useEffect, useCallback, useRef } from 'react';
import { Receipt, Plus } from '@transferwise/icons';
import { Button, SearchInput, Size, AvatarView, Table, Tooltip, Chips } from '@transferwise/components';
import type { AccountType } from '@shared/data/account-registry';
import { ActivitySummary } from '../components/ActivitySummary';
import { useActiveTransactions } from '../hooks/useDatasetData';
import { groupByDate, type Transaction } from '@shared/data/transactions';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, useTxLabels } from '../context/Language';
import { useAllTransactions } from '../hooks/useAccountRegistry';
import './Transactions.css';

function TransactionsTableView({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();
  // Track which row is first in its date group
  const dateFirstIndex = new Map<string, number>();
  transactions.forEach((tx, i) => {
    if (!dateFirstIndex.has(tx.date)) dateFirstIndex.set(tx.date, i);
  });

  const headers = [
    { header: t('transactions.date'), width: '144px' },
    { header: t('transactions.details') },
    { header: t('transactions.attachment'), alignment: 'left' as const, width: '100px' },
    { header: t('transactions.amount'), alignment: 'right' as const, width: '140px' },
  ];

  const rows = transactions.map((tx, i) => {
    const isFirstInDate = dateFirstIndex.get(tx.date) === i;

    return {
      id: i,
      cells: [
        // Date cell
        {
          children: (
            <span className={isFirstInDate ? '' : 'tx-table__hidden-date'}>
              {tx.date}
            </span>
          ),
        },
        // Details cell — custom children matching list view avatars
        {
          children: (
            <div className="tx-table__details-cell">
              {tx.imgSrc ? (
                <AvatarView size={48} imgSrc={tx.imgSrc} style={{ border: 'none' }} />
              ) : (
                <AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                  {tx.icon}
                </AvatarView>
              )}
              <div className="tx-table__details-text">
                <span className="np-text-body-default" style={{ fontWeight: 600, color: 'var(--color-content-primary)' }}>{tx.name}</span>
                {tx.subtitle && (
                  <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{tx.subtitle}</span>
                )}
              </div>
            </div>
          ),
        },
        // Attachment cell
        {
          children: (
            <Tooltip label={t('common.uploadAttachment')} position="top">
              <span style={{ cursor: 'pointer', display: 'inline-flex' }}>
                <AvatarView
                  size={24}
                  badge={{ icon: <Plus size={16} />, type: 'action' as const }}
                >
                  <Receipt size={24} />
                </AvatarView>
              </span>
            </Tooltip>
          ),
        },
        // Amount cell
        {
          children: (
            <div className="tx-table__amount">
              <p className="np-text-body-large" style={{ margin: 0, fontWeight: 600, textAlign: 'right', color: tx.isPositive ? 'var(--color-sentiment-positive)' : 'var(--color-content-primary)' }}>
                {tx.amount}
              </p>
              {tx.amountSub && (
                <p className="np-text-body-default" style={{ margin: 0, textAlign: 'right', color: 'var(--color-content-secondary)' }}>
                  {tx.amountSub}
                </p>
              )}
            </div>
          ),
        },
      ],
    };
  });

  return (
    <Table
      data={{
        headers,
        rows,
        onRowClick: () => {},
      }}
      fullWidth
      className="tx-table"
    />
  );
}

export function Transactions({ accountType = 'personal' }: { accountType?: AccountType }) {
  const { consumerName, businessName } = usePrototypeNames();
  const { t } = useLanguage();
  const txLabels = useTxLabels();
  const currentAccountTx = useActiveTransactions(accountType, consumerName, businessName, txLabels);
  const subAccountTx = useAllTransactions(accountType);
  const transactions = [...currentAccountTx, ...subAccountTx];
  const [search, setSearch] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const isBusiness = accountType === 'business';
  const isSearching = search.length >= 3;
  const filtered = isSearching
    ? transactions.filter((tx) => tx.name.toLowerCase().includes(search.toLowerCase()))
    : transactions;
  const grouped = groupByDate(filtered);

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

  const filterChips = [
    { value: 'hidden', label: t('transactions.includesHidden') },
    { value: 'type', label: t('transactions.type') },
    { value: 'date', label: t('transactions.date') },
    { value: 'recipients', label: t('transactions.recipients') },
    { value: 'category', label: t('transactions.category') },
    { value: 'currency', label: t('transactions.currency') },
    { value: 'direction', label: t('transactions.direction') },
    { value: 'route', label: t('transactions.currencyRoute') },
    { value: 'card', label: t('transactions.card') },
  ];

  return (
    <div className="transactions-page" ref={pageRef}>
      {/* Sticky search + filter chips */}
      <div className="transactions-page__mobile-header">
        <div className="transactions-page__mobile-search">
          <SearchInput
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="transactions-page__mobile-chips">
          <Chips
            chips={filterChips}
            selected={selectedChips}
            multiple
            onChange={(state) => {
              const value = state.selectedValue;
              setSelectedChips(prev =>
                prev.includes(value)
                  ? prev.filter(v => v !== value)
                  : [...prev, value]
              );
            }}
          />
        </div>
        <div className="transactions-page__mobile-divider" />
      </div>

      {isSearching && grouped.length === 0 && (
        <p className="np-text-body-default" style={{ margin: '24px 0', fontWeight: 600, color: 'var(--color-content-primary)' }}>{t('transactions.noResults')}</p>
      )}

      {/* Business desktop/tablet: table view */}
      {isBusiness && filtered.length > 0 && (
        <div className="transactions-page__table-view">
          <TransactionsTableView transactions={filtered} />
        </div>
      )}

      {/* Business mobile OR personal all: list view */}
      <div className={isBusiness ? 'transactions-page__list-view' : undefined}>
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

      <div
        className={`back-to-top${backToTopVisible ? ' back-to-top--visible' : ''}`}
      >
        <Button v2 size="sm" priority="primary" onClick={handleBackToTop}>{t('common.backToTop')}</Button>
      </div>
    </div>
  );
}
