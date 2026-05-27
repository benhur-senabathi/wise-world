import { Button, IconButton, AvatarView, AvatarLayout } from '@transferwise/components';
import { Bank, ChevronRight, Money } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { AccountActionButtons } from './AccountActionButtons';
import { MoreMenu } from './MoreMenu';
import { WiseLogoIcon } from './WiseLogoIcon';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerAccountPageHeader } from './Shimmer';
import { getAccountBySubPageType } from '@shared/data/account-registry';

type Props = {
  type: 'account' | 'currency' | 'group' | 'jar';
  currencyCode?: string;
  label: string;
  balance: string;
  accountDetails?: string;
  menuItems: { label: string; icon?: React.ReactNode; onClick?: () => void }[];
  moreMenuOpen?: boolean;
  onMoreMenuClose?: () => void;
  onAccountDetailsClick?: () => void;
  onBreadcrumbClick?: () => void;
  accountType?: AccountType;
  jarColor?: string;
  jarTextColor?: string;
  jarName?: string;
  jarIcon?: React.ReactNode;
  hideGetPaid?: boolean;
  sendSecondary?: boolean;
  moveOnly?: boolean;
  onAdd?: () => void;
  onConvert?: () => void;
  onSend?: () => void;
  onRequest?: () => void;
  onPaymentLink?: () => void;
};

export function AccountPageHeader({
  type,
  currencyCode,
  label,
  balance,
  accountDetails,
  menuItems,
  moreMenuOpen,
  onMoreMenuClose,
  onAccountDetailsClick,
  onBreadcrumbClick,
  accountType = 'personal',
  jarColor,
  jarTextColor,
  jarName,
  jarIcon,
  hideGetPaid: hideGetPaidProp,
  sendSecondary,
  moveOnly,
  onAdd,
  onConvert,
  onSend,
  onRequest,
  onPaymentLink,
}: Props) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const isBusiness = accountType === 'business';
  const isGroup = type === 'group';
  const isJar = type === 'jar';
  const isJarCurrency = type === 'currency' && !!jarColor;
  const hideGetPaid = hideGetPaidProp ?? false;
  const caStyle = getAccountBySubPageType('account')!.style;
  const wiseAvatarStyle = jarColor
    ? { backgroundColor: jarColor, color: jarTextColor || '#121511' }
    : isBusiness
      ? { backgroundColor: caStyle.textColor, color: caStyle.color }
      : { backgroundColor: 'var(--color-interactive-accent)', color: 'var(--color-interactive-control)' };

  const avatarIcon = jarIcon ? jarIcon : <WiseLogoIcon />;

  if (shimmerMode) return (
    <div className="account-header">
      <ShimmerAccountPageHeader />
    </div>
  );

  return (
    <div className="account-header">
      {/* Top row: avatar + label/breadcrumb ... more menu */}
      <div className="account-header__top-row">
        <div className="account-header__identity">
          {type === 'currency' && currencyCode ? (
            <span className="account-header__avatar-mobile">
              <AvatarLayout
                size={40}
                avatars={[
                  { style: wiseAvatarStyle, asset: avatarIcon },
                  { asset: <Flag code={currencyCode} loading="eager" /> },
                ]}
              />
            </span>
          ) : (
            <span className="account-header__avatar-mobile">
              <AvatarView size={48} style={wiseAvatarStyle}>
                {avatarIcon}
              </AvatarView>
            </span>
          )}
          {type === 'currency' ? (
            <p className="np-text-body-large account-header__breadcrumb">
              <span className="account-header__breadcrumb-link">{jarName || t('home.currentAccount')}</span>
              <span className="account-header__breadcrumb-chevron"><ChevronRight size={16} /></span>
              <span className="account-header__breadcrumb-separator"> / </span>
              <span className="account-header__breadcrumb-code">{currencyCode}</span>
            </p>
          ) : (
            <p className="np-text-body-large account-header__label">{label}</p>
          )}
        </div>
        <div className="account-header__more">
          <MoreMenu items={menuItems} externalOpen={moreMenuOpen} onExternalClose={onMoreMenuClose} />
        </div>
      </div>

      {/* Bottom row: balance + details on left ... action buttons on right */}
      <div className="account-header__bottom-row">
        <div className="account-header__balance-group">
          <h1 className="account-header__balance">{balance}</h1>
          {type !== 'group' && type !== 'jar' && onAccountDetailsClick && (
            <div className="account-header__details">
              <Button
                v2
                size="sm"
                priority="secondary"
                addonStart={{ type: 'icon', value: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 5.18 7.487 8h9.026zm-.535-2.025a1.01 1.01 0 0 1 1.07 0L20.5 8.134c.861.537.48 1.866-.535 1.866H19v9h2v2H3v-2h2v-9h-.965C3.02 10 2.639 8.671 3.5 8.134zM7 19h4v-9H7zm6 0h4v-9h-4z" clipRule="evenodd"/></svg> }}
                addonEnd={{ type: 'icon', value: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="m9.005 4.995-1.41 1.41 5.58 5.59-5.58 5.59 1.41 1.41 6.99-7z" clipRule="evenodd"/></svg> }}
                onClick={onAccountDetailsClick}
              >
                {accountDetails || t('common.accountDetails')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="account-header__actions-mobile">
        <AccountActionButtons accountType={accountType} hideGetPaid={hideGetPaid} hideSend={!onSend && !sendSecondary} sendSecondary={sendSecondary} moveOnly={moveOnly} onAdd={onAdd} onConvert={onConvert} onSend={onSend} onRequest={onRequest} onPaymentLink={onPaymentLink} />
      </div>
    </div>
  );
}
