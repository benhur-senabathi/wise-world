import { Button, AvatarView, IconButton } from '@transferwise/components';
import { ArrowLeft, ChevronRight, Menu, Plus } from '@transferwise/icons';
import { useLanguage } from '../context/Language';

export function TopBar({
  name,
  initials,
  avatarUrl,
  onMenuToggle,
  onAccountClick,
  showBack,
  onBack,
  hideAccountSwitcher,
  hideOpenButton,
}: {
  name: string;
  initials: string;
  avatarUrl?: string;
  onMenuToggle?: () => void;
  onAccountClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  hideAccountSwitcher?: boolean;
  hideOpenButton?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <header className="top-bar">
      <div className="top-bar__hamburger">
        <IconButton aria-label={t('topBar.openMenu')} priority="tertiary" onClick={onMenuToggle}>
          <Menu size={24} />
        </IconButton>
      </div>
      {showBack && (
        <div className="top-bar__back">
          <IconButton aria-label={t('topBar.goBack')} priority="tertiary" onClick={onBack}>
            <ArrowLeft size={24} />
          </IconButton>
        </div>
      )}
      <div className="top-bar__actions">
        <Button v2 size="sm" priority="primary">{t('topBar.earn')}</Button>
        {!hideOpenButton && (
          <Button v2 size="sm" priority="secondary" addonEnd={{ type: 'icon', value: <Plus size={16} /> }}>{t('topBar.open')}</Button>
        )}
        {!hideAccountSwitcher && (
          <a href="/your-account" className="account-switcher" onClick={(e) => { e.preventDefault(); onAccountClick?.(); }}>
            {avatarUrl ? (
              <AvatarView size={48} profileName={name} imgSrc={avatarUrl} />
            ) : (
              <AvatarView size={48} profileName={name}>
                <span style={{ fontSize: 20 }}>{initials}</span>
              </AvatarView>
            )}
            <span className="account-switcher__name">{name}</span>
            <ChevronRight size={16} />
          </a>
        )}
      </div>
    </header>
  );
}
