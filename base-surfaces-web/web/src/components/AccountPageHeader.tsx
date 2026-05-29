import { Button, IconButton, AvatarView, AvatarLayout } from '@transferwise/components';
import { Bank, ChevronRight } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { AccountActionButtons } from './AccountActionButtons';
import { MoreMenu } from './MoreMenu';
import { WiseLogoIcon } from './WiseLogoIcon';
import type { AccountType } from '@shared/data/account-registry';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerAccountPageHeader } from './AccountPageHeader.shimmer';
import { getAccountBySubPageType } from '@shared/data/account-registry';
import './AccountPageHeader.css';

type Props = {
  type: 'account' | 'currency' | 'group' | 'jar';
  currencyCode?: string;
  label: string;
  balance: string;
  accountDetails?: string;
  menuItems: { label: string; onClick?: () => void }[];
  onAccountDetailsClick?: () => void;
  onBreadcrumbClick?: () => void;
  accountType?: AccountType;
  jarColor?: string;
  jarTextColor?: string;
  jarName?: string;
  jarIcon?: React.ReactNode;
  hideGetPaid?: boolean;
  moveOnly?: boolean;
  sendSecondary?: boolean;
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
  onAccountDetailsClick,
  onBreadcrumbClick,
  accountType = 'personal',
  jarColor,
  jarTextColor,
  jarName,
  jarIcon,
  hideGetPaid: hideGetPaidProp,
  moveOnly,
  sendSecondary,
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
            <>
              <span className="account-header__avatar-desktop">
                <AvatarLayout
                  size={32}
                  avatars={[
                    { style: wiseAvatarStyle, asset: avatarIcon },
                    { asset: <Flag code={currencyCode} loading="eager" /> },
                  ]}
                />
              </span>
              <span className="account-header__avatar-mobile">
                <AvatarLayout
                  size={48}
                  avatars={[
                    { style: wiseAvatarStyle, asset: avatarIcon },
                    { asset: <Flag code={currencyCode} loading="eager" /> },
                  ]}
                />
              </span>
            </>
          ) : (
            <>
              <span className="account-header__avatar-desktop">
                <AvatarView size={32} style={wiseAvatarStyle}>
                  {avatarIcon}
                </AvatarView>
              </span>
              <span className="account-header__avatar-mobile">
                <AvatarView size={48} style={wiseAvatarStyle}>
                  {avatarIcon}
                </AvatarView>
              </span>
            </>
          )}
          {type === 'currency' ? (
            <p className="np-text-body-large account-header__breadcrumb">
              <span className="account-header__breadcrumb-link">{jarName || t('home.currentAccount')}</span>
              <span className="account-header__breadcrumb-chevron"><ChevronRight size={16} /></span>
              <span className="account-header__breadcrumb-code">{currencyCode}</span>
            </p>
          ) : (
            <p className="np-text-body-large account-header__label">{label}</p>
          )}
        </div>
        <div className="account-header__more">
          <MoreMenu items={menuItems} />
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
                addonStart={{ type: 'icon', value: <Bank size={16} /> }}
                addonEnd={{ type: 'icon', value: <ChevronRight size={16} /> }}
                onClick={onAccountDetailsClick}
              >
                {accountDetails || t('common.accountDetails')}
              </Button>
            </div>
          )}
        </div>
        <div className="account-header__actions-desktop">
          <AccountActionButtons accountType={accountType} hideGetPaid={hideGetPaid} moveOnly={moveOnly} sendSecondary={sendSecondary} onAdd={onAdd} onConvert={onConvert} onSend={onSend} onRequest={onRequest} onPaymentLink={onPaymentLink} />
        </div>
      </div>

      {/* Mobile/tablet: action buttons below, centered */}
      <div className="account-header__actions-mobile">
        <AccountActionButtons accountType={accountType} hideGetPaid={hideGetPaid} moveOnly={moveOnly} sendSecondary={sendSecondary} onAdd={onAdd} onConvert={onConvert} onSend={onSend} onRequest={onRequest} onPaymentLink={onPaymentLink} />
      </div>
    </div>
  );
}
