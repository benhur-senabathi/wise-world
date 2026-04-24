import { AvatarView } from '@transferwise/components';
import { ArrowLeft, Suitcase, GiftBox, BarChart, Graph, More, Plus } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { useLanguage } from '../context/Language';
import { useLiquidGlass } from '../hooks/useLiquidGlass';

// Raw SVGs — Neptune icons don't render at non-standard sizes
const EyeShutIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12.348 14.4c3.286-.178 5.52-2.854 6.859-4.6l1.586 1.218c-.286.373-.645.836-1.078 1.333l.429.428.849.849.424.424-1.414 1.415-.425-.425-.848-.848-.416-.416a12 12 0 0 1-1.802 1.34l.166.288.562.974.281.487-1.732 1-.28-.487-.563-.974-.254-.44A8.4 8.4 0 0 1 13 16.35v1.988h-2V16.35a8.4 8.4 0 0 1-1.928-.467l-.302.523-.563.974-.281.487-1.732-1 .281-.487.563-.974.24-.417a12 12 0 0 1-1.627-1.241l-.365.365-.796.796-.397.398-1.415-1.415.398-.397.796-.796.383-.383c-.42-.483-.769-.933-1.048-1.298l1.586-1.217c1.34 1.745 3.573 4.42 6.859 4.6z" clipRule="evenodd"/>
  </svg>
);

const EyeOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.843 13.607C6.222 11.799 8.55 9 12 9s5.778 2.8 7.157 4.607l1.59-1.213C19.428 10.664 16.55 7 12 7s-7.428 3.665-8.747 5.393zM10 15a2 2 0 1 1 4 0 2 2 0 0 1-4 0m2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8" clipRule="evenodd"/>
  </svg>
);

function GlassCircle({ children, onClick, ariaLabel }: { children: React.ReactNode; onClick?: () => void; ariaLabel?: string }) {
  const glass = useLiquidGlass<HTMLButtonElement>();
  return (
    <button
      ref={glass.ref}
      className="ios-glass-btn ios-glass-btn--circle"
      onClick={onClick}
      aria-label={ariaLabel}
      onPointerDown={glass.onPointerDown}
      onPointerMove={glass.onPointerMove}
      onPointerUp={glass.onPointerUp}
      onPointerCancel={glass.onPointerUp}
    >
      {children}
    </button>
  );
}

function GlassPill({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const glass = useLiquidGlass<HTMLButtonElement>();
  return (
    <button
      ref={glass.ref}
      className={`ios-glass-btn ios-glass-btn--pill ${className || ''}`}
      onClick={onClick}
      onPointerDown={glass.onPointerDown}
      onPointerMove={glass.onPointerMove}
      onPointerUp={glass.onPointerUp}
      onPointerCancel={glass.onPointerUp}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick, label }: { onClick?: () => void; label: string }) {
  return (
    <GlassCircle onClick={onClick} ariaLabel={label}>
      <span className="ios-glass-btn__icon">
        <ArrowLeft size={24} />
      </span>
    </GlassCircle>
  );
}

export function IOSTopBar({
  name,
  initials,
  avatarUrl,
  onAccountClick,
  showBack,
  onBack,
  hideAccountSwitcher,
  activeNavItem,
  subPageType,
  subPageCode,
  scrollTitle,
  accountType,
  onInsightsClick,
  onMore,
  cardsTab,
  balanceHidden,
  onToggleBalance,
}: {
  name: string;
  initials: string;
  avatarUrl?: string;
  onAccountClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  hideAccountSwitcher?: boolean;
  activeNavItem?: string;
  subPageType?: string | null;
  subPageCode?: string;
  scrollTitle?: string | null;
  accountType?: 'personal' | 'business';
  cardsTab?: 'your' | 'team';
  balanceHidden?: boolean;
  onToggleBalance?: () => void;
  onInsightsClick?: () => void;
  onMore?: () => void;
}) {
  const { t } = useLanguage();

  const isHome = !showBack && activeNavItem === 'Home';
  const isCards = !showBack && activeNavItem === 'Cards';
  const isPayments = !showBack && activeNavItem === 'Payments';
  const isRecipients = !showBack && activeNavItem === 'Recipients';
  const isTransactions = showBack && activeNavItem === 'Transactions';
  const isInsights = showBack && activeNavItem === 'Insights';
  const isAccount = showBack && activeNavItem === 'Account';
  const isCurrencyOrAccount = showBack && subPageType && ['account', 'taxes-account', 'jar-account', 'currency'].includes(subPageType);
  const isAccountDetails = showBack && subPageType === 'account-details';
  const isDrillDown = showBack && !isTransactions && !isInsights && !isAccount && !isCurrencyOrAccount && !isAccountDetails && !isCards && !isPayments && !isRecipients;

  const renderLeading = () => {
    if (showBack) {
      return <BackButton onClick={onBack} label={t('topBar.goBack')} />;
    }
    if (isHome && !hideAccountSwitcher) {
      return (
        <button className="ios-glass-btn ios-glass-btn--avatar" onClick={onAccountClick} aria-label="Account">
          {avatarUrl ? (
            <AvatarView size={40} profileName={name} imgSrc={avatarUrl} />
          ) : (
            <AvatarView size={40} profileName={name}>
              <span style={{ fontSize: 16 }}>{initials}</span>
            </AvatarView>
          )}
        </button>
      );
    }
    if (isCards) {
      return (
        <GlassPill>
          <span className="ios-glass-btn__icon"><Suitcase size={16} /></span>
          <span className="ios-glass-btn__label">Travel hub</span>
        </GlassPill>
      );
    }
    return null;
  };

  const renderTrailing = () => {
    // Home: Earn + Eye (personal) or Earn + Capsule[Graph|Eye] (business)
    if (isHome) {
      const isBusiness = accountType === 'business';
      return (
        <div className="ios-top-bar__trailing">
          <GlassPill className="ios-glass-btn--accent">
            <span className="ios-glass-btn__label">{t('topBar.earn')}</span>
          </GlassPill>
          {isBusiness ? (
            <GlassPill className="ios-glass-btn--capsule">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="ios-glass-btn__label">{t('topBar.open')}</span>
                <span className="ios-glass-btn__icon"><Plus size={24} /></span>
              </span>
              <span className="ios-glass-btn__icon" onClick={(e) => { e.stopPropagation(); onInsightsClick?.(); }}>
                <BarChart size={24} />
              </span>
            </GlassPill>
          ) : (
            <GlassCircle ariaLabel={balanceHidden ? t('balance.showBalance') : t('balance.hideBalance')} onClick={onToggleBalance}>
              {balanceHidden ? <EyeShutIcon /> : <EyeOpenIcon />}
            </GlassCircle>
          )}
        </div>
      );
    }
    // Cards: Order a card (hide on business team tab)
    if (isCards && !(accountType === 'business' && cardsTab === 'team')) {
      return (
        <GlassPill className="ios-glass-btn--accent">
          <span className="ios-glass-btn__label">Order a card</span>
        </GlassPill>
      );
    }
    // Transactions: Bar chart
    if (isTransactions) {
      return (
        <GlassCircle ariaLabel="Insights">
          <span className="ios-glass-btn__icon"><BarChart size={24} /></span>
        </GlassCircle>
      );
    }
    // Recipients: Invite pill
    if (isRecipients) {
      return (
        <GlassPill>
          <span className="ios-glass-btn__icon"><GiftBox size={16} /></span>
          <span className="ios-glass-btn__label">Invite</span>
        </GlassPill>
      );
    }
    // Account: Open an account pill
    if (isAccount) {
      return (
        <GlassPill>
          <span className="ios-glass-btn__label">Open an account</span>
        </GlassPill>
      );
    }
    // CurrencyPage / CurrentAccount / TaxesAccount: More menu
    if (isCurrencyOrAccount) {
      return (
        <GlassCircle ariaLabel="More" onClick={onMore}>
          <span className="ios-glass-btn__icon"><More size={24} /></span>
        </GlassCircle>
      );
    }
    return null;
  };

  return (
    <header className="ios-top-bar">
      <div className="ios-top-bar__fade" />
      <div className="ios-top-bar__bar">
        {renderLeading()}
        <div className="ios-top-bar__spacer" />
        {isAccountDetails && subPageCode ? (
          <div className="ios-top-bar__center-title">
            <span className="ios-top-bar__center-heading">{subPageCode}</span>
            <span className="ios-top-bar__center-subtitle">{t('common.accountDetails')}</span>
          </div>
        ) : scrollTitle ? (
          <span className="ios-top-bar__scroll-title">{scrollTitle}</span>
        ) : null}
        <div className="ios-top-bar__spacer" />
        {isAccountDetails && subPageCode ? (
          <span className="ios-top-bar__detail-flag">
            <Flag code={subPageCode} />
          </span>
        ) : renderTrailing()}
      </div>
    </header>
  );
}
