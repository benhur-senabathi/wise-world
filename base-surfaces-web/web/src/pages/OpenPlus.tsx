import { OverlayHeader, Logo, AvatarView, ListItem } from '@transferwise/components';
import { CardWise, Savings as SavingsIcon, People, Suitcase, SpendDollar, Jar } from '@transferwise/icons';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import { savingsJar, suppliesJar } from '@shared/data/jar-data';
import { groupCurrencies } from '@shared/data/group-data';

type OpenItem = {
  titleKey: string;
  subtitleKey: string;
  icon: React.ReactNode;
  bg: string;
  color: string;
};

const openItems: OpenItem[] = [
  { titleKey: 'open.childCard', subtitleKey: 'open.childCardSub', icon: <CardWise size={24} />, bg: 'var(--color-dark-purple)', color: 'var(--color-bright-orange)' },
  { titleKey: 'open.moneyAside', subtitleKey: 'open.moneyAsideSub', icon: <SavingsIcon size={24} />, bg: 'var(--color-dark-gold)', color: 'var(--color-bright-yellow)' },
  { titleKey: 'open.spendGroup', subtitleKey: 'open.spendGroupSub', icon: <People size={24} />, bg: 'var(--color-dark-maroon)', color: 'var(--color-bright-pink)' },
  { titleKey: 'open.loungePass', subtitleKey: 'open.loungePassSub', icon: <Suitcase size={24} />, bg: 'var(--color-dark-charcoal)', color: 'var(--color-bright-blue)' },
];

type AccountItem = {
  label: string;
  icon: React.ReactNode;
};

type Props = {
  accountType: AccountType;
  onClose: () => void;
  avatarUrl: string;
  initials: string;
};

export function OpenPlus({ accountType, onClose, avatarUrl, initials }: Props) {
  const { t } = useLanguage();
  const isBusiness = accountType === 'business';
  const avatarStyle = isBusiness
    ? { backgroundColor: '#163300', color: '#9fe870' }
    : undefined;

  const avatar = avatarUrl ? (
    <AvatarView size={48} imgSrc={avatarUrl} />
  ) : (
    <AvatarView size={48} style={avatarStyle}>
      {initials}
    </AvatarView>
  );

  const accountAvatarStyle = { backgroundColor: 'var(--color-dark-gold)', color: 'var(--color-bright-yellow)', border: 'none' };

  const accountItems: AccountItem[] = [
    { label: t('home.currentAccount'), icon: <SpendDollar size={24} /> },
  ];

  // Mirror Home.tsx: business shows Taxes group + suppliesJar; personal shows savingsJar
  if (isBusiness) {
    if (groupCurrencies.length > 0) {
      accountItems.push({ label: t('home.taxes' as any), icon: <Jar size={24} /> });
    }
    accountItems.push({ label: t(suppliesJar.nameKey as any), icon: <Jar size={24} /> });
  } else {
    accountItems.push({ label: t(savingsJar.nameKey as any), icon: <Jar size={24} /> });
  }

  return (
    <div className="open-plus-flow">
      <OverlayHeader
        onClose={onClose}
        avatar={avatar}
        logo={<Logo />}
      />

      <div className="open-plus-flow__body">
        <h1 className="np-text-title-screen" style={{ textAlign: 'center', margin: '0 0 32px' }}>
          {t('open.title')}
        </h1>

        <div className="open-plus-flow__items">
          {openItems.map((item) => (
            <ListItem
              key={item.titleKey}
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t(item.titleKey as any)}</span>}
              subtitle={t(item.subtitleKey as any)}
              media={
                <ListItem.AvatarView
                  size={48}
                  style={{ backgroundColor: item.bg, color: item.color, border: 'none' }}
                >
                  {item.icon}
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => {}} />}
            />
          ))}
        </div>

        <div className="open-plus-flow__section-header">
          <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>
            {t('open.addCurrencyTo' as any)}
          </span>
          <hr className="open-plus-flow__divider" />
        </div>

        <div className="open-plus-flow__accounts">
          {accountItems.map((account) => (
            <ListItem
              key={account.label}
              title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{account.label}</span>}
              media={
                <ListItem.AvatarView
                  size={48}
                  style={accountAvatarStyle}
                >
                  {account.icon}
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => {}} />}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
