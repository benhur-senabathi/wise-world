import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Slider, Documents, Receipt, Plus } from '@transferwise/icons';
import { Button, SearchInput, Size, AvatarView, Table, Tooltip } from '@transferwise/components';
import type { AccountType } from '../App';
import { ActivitySummary } from '../components/ActivitySummary';
import { useActiveTransactions } from '../hooks/useDatasetData';
import { groupByDate, type Transaction } from '../data/transactions';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage, useTxLabels } from '../context/Language';

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
  const transactions = useActiveTransactions(accountType, consumerName, businessName, txLabels);
  const [search, setSearch] = useState('');
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const [btnLeft, setBtnLeft] = useState<number | undefined>();

  const isSearching = search.length >= 3;
  const filtered = isSearching
    ? transactions.filter((tx) => tx.name.toLowerCase().includes(search.toLowerCase()))
    : transactions;
  const grouped = groupByDate(filtered);

  useEffect(() => {
    const updatePosition = () => {
      if (pageRef.current) {
        const rect = pageRef.current.getBoundingClientRect();
        setBtnLeft(rect.left + rect.width / 2);
      }
    };

    const handleScroll = () => {
      setBackToTopVisible(window.scrollY > 400);
    };

    updatePosition();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updatePosition);
    };
  }, []);

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="transactions-page" ref={pageRef}>
      <div className={`transactions-page__header${isBusiness ? ' transactions-page__header--business' : ''}`}>
        <h1 className="np-text-title-screen" style={{ margin: 0 }}>{t('transactions.title')}</h1>
        <div className="transactions-page__actions">
          <div className="transactions-page__search">
            <SearchInput
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size={Size.SMALL}
            />
          </div>
          <Button v2 size="sm" priority="primary" addonStart={{ type: 'icon', value: <Slider size={16} /> }}>{isSearching ? t('common.filtersActive') : t('common.filters')}</Button>
          <Button v2 size="sm" priority="primary" addonStart={{ type: 'icon', value: <Download size={16} /> }}>{t('common.download')}</Button>
          {isBusiness && (
            <div className="transactions-page__statements">
              <Button v2 size="sm" priority="secondary-neutral" addonStart={{ type: 'icon', value: <Documents size={16} /> }}>{t('common.statementsAndReports')}</Button>
            </div>
          )}
        </div>
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
        style={btnLeft !== undefined ? { left: btnLeft } : undefined}
      >
        <Button v2 size="sm" priority="primary" onClick={handleBackToTop}>{t('common.backToTop')}</Button>
      </div>
    </div>
  );
}
