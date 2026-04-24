import { useMemo } from 'react';
import { Button, ListItem, AvatarLayout } from '@transferwise/components';
import { ChevronRight, Rewards } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { currencies as defaultCurrencyData, type CurrencyData } from '@shared/data/currencies';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerAccountCard } from './Shimmer';

const MAX_BODY_WIDTH = 85;

function getMaxAmountWidth(amounts: string[]): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = '400 16px Inter, sans-serif';
  return Math.max(...amounts.map((a) => ctx.measureText(a).width));
}

type Balance = {
  code: string;
  amount: string;
};

type Props = {
  title: string;
  totalAmount: string;
  currencyCount: number;
  balances: Balance[];
  hasCards?: boolean;
  cardCount?: number;
  onNavigateCards?: () => void;
  onNavigateAccount?: () => void;
  onNavigateCurrency?: (code: string) => void;
  currencyData?: CurrencyData[];
  cardTopImage?: string;
  cardBottomImage?: string;
  hideAccountDetails?: boolean;
  cardInfoLight?: boolean;
  businessCardStyle?: boolean;
  onAccountDetails?: () => void;
  balanceHidden?: boolean;
};

export function MultiCurrencyAccountCard({
  title,
  totalAmount,
  currencyCount,
  balances,
  hasCards = true,
  cardCount = 2,
  onNavigateCards,
  onNavigateAccount,
  onNavigateCurrency,
  currencyData = defaultCurrencyData,
  cardTopImage,
  cardBottomImage,
  hideAccountDetails = false,
  cardInfoLight = false,
  businessCardStyle = false,
  onAccountDetails,
  balanceHidden,
}: Props) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const effectiveCardInfoLight = cardInfoLight || businessCardStyle;

  if (shimmerMode) return <ShimmerAccountCard />;

  const maxAmountWidth = useMemo(() => getMaxAmountWidth(balances.map((b) => b.amount)), [balances]);

  const stacked = useMemo(() => {
    if (balances.length <= 2) return false;
    return maxAmountWidth > MAX_BODY_WIDTH;
  }, [balances, maxAmountWidth]);

  const displayBalances = stacked ? balances.slice(0, 3) : balances;

  return (
    <article className="mca">
      {hasCards && (
        <div
          className="mca-cards__stack"
          role="button"
          tabIndex={0}
          onClick={() => onNavigateCards?.()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateCards?.(); } }}
          style={{ cursor: 'pointer' }}
        >
          <div className="mca-cards__fire">
            <img
              src={cardTopImage || new URL('../assets/card-tapestry.jpg', import.meta.url).href}
              alt="Wise tapestry card"
              loading="eager"
            />
          </div>
          {/* Business card gradient: custom forest-green shades on a fixed dark surface, theme-independent */}
          {businessCardStyle ? (
            <div
              className="mca-cards__green"
              style={{ background: 'linear-gradient(135deg, #1a3d00 0%, #163300 40%, #122b00 100%)', aspectRatio: '330/208', borderRadius: '20px 20px 0 0' }}
            />
          ) : (
            <img
              className="mca-cards__green"
              src={cardBottomImage || new URL('../assets/card-green.jpg', import.meta.url).href}
              alt="Wise green card"
              loading="eager"
            />
          )}
          {/* Forced colors: text overlays a dark card image/gradient, must stay readable in both themes */}
          <div className="mca-cards__info" style={effectiveCardInfoLight ? { color: '#fff' } : undefined}>
            <a href="#" className="mca-cards__link" style={effectiveCardInfoLight ? { color: '#fff' } : undefined} onClick={(e) => { e.preventDefault(); onNavigateCards?.(); }}>
              {t('accountCard.cards', { count: cardCount })} <ChevronRight size={16} />
            </a>
            <span className="mca-cards__badge" style={businessCardStyle ? { color: '#9fe870' } : effectiveCardInfoLight ? { color: '#fff' } : undefined}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1.875 15.28 7.35 8.838h-.002L4.02 3h18.105l-7.008 19.375h-3.97L16.95 6.3H9.463l1.665 2.883-.008.08-2.56 2.979h4.188l-1.098 3.037z" />
              </svg>
            </span>
          </div>
        </div>
      )}

      {!hasCards && (
        <div className="mca-cards__stack mca-cards__stack--empty">
          <div className="mca-cards__empty-card" />
        </div>
      )}

      <div className="mca-front">
        <div className="mca-front__cutout">
          <svg width="330" height="16" viewBox="0 0 330 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <g clipPath="url(#cutout-clip)">
              <path d="M322 0C326.418 0 330 3.58172 330 8C330 12.4183 326.418 16 322 16H8C3.58172 16 0 12.4183 0 8C2.49657e-07 3.58172 3.58172 0 8 0H126.806C134.929 0 142.144 4.72959 148.943 9.1743C153.622 12.2329 159.148 14 165.067 14C170.987 13.9999 176.513 12.2328 181.191 9.17433C187.99 4.72955 195.204 0 203.327 0H322Z" fill="currentColor" />
              <rect width="16" height="16" fill="currentColor" />
              <rect width="16" height="16" x="314" fill="currentColor" />
            </g>
            <defs>
              <clipPath id="cutout-clip">
                <rect width="330" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <ul className="wds-list list-unstyled m-y-0">
          <ListItem
            title={<h3 className="np-text-title-subsection" style={{ margin: 0 }}>{title}</h3>}
            subtitle={currencyCount >= 2 ? (
              <div className="np-text-body-large">
                {balanceHidden ? '****' : totalAmount}&nbsp;· {currencyCount} {t('accountCard.currency', { count: currencyCount })}
              </div>
            ) : undefined}
            control={<ListItem.Navigation onClick={() => onNavigateAccount?.()} />}
          />
        </ul>

        <ul className={`wds-list list-unstyled m-y-0 mca-balances${stacked ? ' mca-balances--stacked' : ''}`} aria-label={`${title}. ${totalAmount}.`}>
          {displayBalances.map(({ code, amount }) => {
            const cd = currencyData.find((c) => c.code === code);
            const isActive = cd?.hasStocks || cd?.hasInterest;
            const media = isActive ? (
              <div className="mca-diagonal-avatar">
                <AvatarLayout
                  size={48}
                  orientation="diagonal"
                  avatars={[
                    { asset: <Flag code={code} loading="eager" /> },
                    { style: { backgroundColor: 'var(--color-background-screen)', border: '1px solid var(--color-border-neutral)', color: 'var(--color-content-primary)' }, asset: <Rewards size={32} /> },
                  ]}
                />
              </div>
            ) : (
              <ListItem.AvatarView size={24}><Flag code={code} loading="eager" /></ListItem.AvatarView>
            );

            return (
              <ListItem
                key={code}
                title={<span className="np-text-body-large" style={{ minWidth: Math.ceil(maxAmountWidth) }}>{balanceHidden ? '****' : amount}</span>}
                media={media}
                control={<ListItem.Navigation onClick={() => onNavigateCurrency?.(code)} />}
              />
            );
          })}
        </ul>

        {!hideAccountDetails && (
          <div className="mca-footer">
            <Button
              v2
              size="sm"
              priority="secondary-neutral"
              addonStart={{ type: 'icon', value: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 5.18 7.487 8h9.026zm-.535-2.025a1.01 1.01 0 0 1 1.07 0L20.5 8.134c.861.537.48 1.866-.535 1.866H19v9h2v2H3v-2h2v-9h-.965C3.02 10 2.639 8.671 3.5 8.134zM7 19h4v-9H7zm6 0h4v-9h-4z" clipRule="evenodd"/></svg> }}
              onClick={onAccountDetails}
            >
              {t('common.accountDetails')}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
