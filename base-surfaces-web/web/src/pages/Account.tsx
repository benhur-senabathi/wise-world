import { useState } from 'react';
import { useSnackbar, ListItem, Button, AvatarView, IconButton, Badge, BottomSheet } from '@transferwise/components';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage } from '../context/Language';
import type { TranslationKey } from '../translations/en';
import {
  LogOut, Notification, QuestionMark, Documents,
  Shield, Link, Bank, Theme, People, Profile,
  InfoCircle, CrossCircle, Building, Briefcase, Limit,
  Tags, Camera, Plus,
} from '@transferwise/icons';
import type { ComponentType } from 'react';
import type { AccountType } from '@shared/data/account-registry';
import './Account.css';

interface MenuItem {
  titleKey: TranslationKey;
  icon: ComponentType<any>;
  subtitleKey?: TranslationKey;
}

const YOUR_ACCOUNT_ITEMS: MenuItem[] = [
  { titleKey: 'account.inbox', icon: Notification },
  { titleKey: 'account.pricingAndDiscounts', icon: Tags },
  { titleKey: 'account.help', icon: QuestionMark },
  { titleKey: 'common.statementsAndReports', icon: Documents },
];

const SETTINGS_ITEMS: MenuItem[] = [
  { titleKey: 'account.securityAndPrivacy', icon: Shield, subtitleKey: 'account.securitySub' },
  { titleKey: 'account.notifications', icon: Notification, subtitleKey: 'account.notificationsSub' },
  { titleKey: 'account.integrationsAndTools', icon: Link, subtitleKey: 'account.integrationsSub' },
  { titleKey: 'account.paymentMethods', icon: Bank, subtitleKey: 'account.paymentMethodsSub' },
  { titleKey: 'account.limits', icon: Limit, subtitleKey: 'account.limitsSub' },
  { titleKey: 'account.languageAndAppearance', icon: Theme, subtitleKey: 'account.languageSub' },
  { titleKey: 'account.personalDetails', icon: Profile, subtitleKey: 'account.personalDetailsSub' },
];

const BUSINESS_SETTINGS_ITEMS: MenuItem[] = [
  { titleKey: 'account.teamMembers', icon: People, subtitleKey: 'account.teamMembersSub' },
  { titleKey: 'account.securityAndPrivacy', icon: Shield, subtitleKey: 'account.securitySub' },
  { titleKey: 'account.notifications', icon: Notification, subtitleKey: 'account.notificationsSub' },
  { titleKey: 'account.integrationsAndTools', icon: Link, subtitleKey: 'account.integrationsSubBusiness' },
  { titleKey: 'account.paymentMethods', icon: Bank, subtitleKey: 'account.paymentMethodsSub' },
  { titleKey: 'account.limits', icon: Limit, subtitleKey: 'account.limitsSub' },
  { titleKey: 'account.languageAndAppearance', icon: Theme, subtitleKey: 'account.languageSub' },
  { titleKey: 'account.personalDetails', icon: Profile, subtitleKey: 'account.personalDetailsSub' },
  { titleKey: 'account.businessDetails', icon: Building, subtitleKey: 'account.businessDetailsSub' },
];

const ACTIONS_ITEMS: MenuItem[] = [
  { titleKey: 'account.referrals', icon: People, subtitleKey: 'account.referralsSub' },
  { titleKey: 'account.ourAgreements', icon: InfoCircle },
  { titleKey: 'account.closeAccount', icon: CrossCircle, subtitleKey: 'account.closePersonalSub' },
];

function getBusinessActionsItems(): MenuItem[] {
  return [
    { titleKey: 'account.referrals', icon: People, subtitleKey: 'account.referralsSub' },
    { titleKey: 'account.ourAgreements', icon: InfoCircle },
    { titleKey: 'account.closeAccount', icon: CrossCircle, subtitleKey: 'account.closeBusinessSub' },
  ];
}

function MenuSection({ title, items, isFirst = false, titleClass, businessName }: { title: string; items: MenuItem[]; isFirst?: boolean; titleClass?: string; businessName?: string }) {
  const { t } = useLanguage();

  return (
    <div className={isFirst ? '' : 'account-page__section'}>
      <h2 className={titleClass || 'np-text-title-subsection'} style={{ margin: 0 }}>{title}</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(({ titleKey, icon: Icon, subtitleKey }) => {
          const resolvedTitle = t(titleKey);
          const resolvedSubtitle = subtitleKey
            ? (subtitleKey === 'account.closeBusinessSub' && businessName
              ? t(subtitleKey, { businessName })
              : t(subtitleKey))
            : undefined;

          return (
            <ListItem
              key={titleKey}
              title={resolvedTitle}
              subtitle={resolvedSubtitle}
              media={
                <ListItem.AvatarView size={48}>
                  <Icon size={24} />
                </ListItem.AvatarView>
              }
              control={<ListItem.Navigation onClick={() => {}} />}
            />
          );
        })}
      </ul>
    </div>
  );
}

export function Account({ onBack, accountType = 'personal', onSwitchAccount, avatarUrl }: { onBack?: () => void; accountType?: AccountType; onSwitchAccount?: (type: AccountType) => void; avatarUrl?: string }) {
  const createSnackbar = useSnackbar();
  const { consumerName, businessName } = usePrototypeNames();
  const { t } = useLanguage();
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeName = accountType === 'business' ? businessName : consumerName;
  const otherName = accountType === 'business' ? consumerName : businessName;

  const handleCopyMembership = () => {
    navigator.clipboard.writeText('P73920461');
    createSnackbar({ text: 'Membership number copied' } as any);
  };

  return (
    <div className="account-page">
      <div className="account-page__layout">
        {/* Left Column */}
        <div className="account-page__sidebar">
          {/* Profile Card */}
          <div className="account-page__profile-card">
            <div className="account-page__avatar">
              <Badge badge={
                <div className="account-page__camera-badge">
                  <Camera size={16} />
                </div>
              }>
                <AvatarView size={72} profileName={activeName} imgSrc={accountType === 'business' ? '/berry-design-logo.png' : (avatarUrl || 'https://www.tapback.co/api/avatar/connor-berry.webp')} />
              </Badge>
            </div>

            <h1 className="account-page__name">
              {activeName}
            </h1>
            <p className="np-text-title-group" style={{ margin: '4px 0 0', color: 'var(--color-content-secondary)' }}>
              {accountType === 'business' ? t('account.yourBusinessAccount') : t('account.yourPersonalAccount')}
            </p>
          </div>

          {/* Mobile-only: Other accounts row — inside left column, below card */}
          <div className="account-page__mobile-accounts">
            <div className="account-page__mobile-accounts-border">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <ListItem
                  title={<span style={{ color: 'var(--color-content-secondary)' }}>{t('account.otherAccounts')}</span>}
                  subtitle={t('account.switchOrOpen')}
                  media={
                    <AvatarView size={40} profileName={otherName} imgSrc={accountType === 'business' ? (avatarUrl || 'https://www.tapback.co/api/avatar/connor-berry.webp') : '/berry-design-logo.png'} />
                  }
                  control={<ListItem.Navigation onClick={() => setSheetOpen(true)} />}
                />
              </ul>
            </div>
          </div>

          {/* Bottom sheet for account switching */}
          <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
            <div className="account-sheet">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <ListItem
                  title={otherName}
                  subtitle={accountType === 'business' ? t('account.personalAccount') : t('account.businessAccount')}
                  media={
                    <AvatarView size={48} profileName={otherName} imgSrc={accountType === 'business' ? (avatarUrl || 'https://www.tapback.co/api/avatar/connor-berry.webp') : '/berry-design-logo.png'} />
                  }
                  control={<ListItem.Navigation onClick={() => { setSheetOpen(false); onSwitchAccount?.(accountType === 'business' ? 'personal' : 'business'); }} />}
                  spotlight="active"
                />
                <ListItem
                  title={t('account.openAnotherBusiness')}
                  media={
                    <Badge badge={
                      <div className="account-page__plus-badge">
                        <Plus size={16} />
                      </div>
                    }>
                      <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                        <Briefcase size={24} />
                      </ListItem.AvatarView>
                    </Badge>
                  }
                  control={<ListItem.Navigation onClick={() => setSheetOpen(false)} />}
                  spotlight="inactive"
                />
              </ul>
            </div>
          </BottomSheet>

          {/* Account rows — outside the card */}
          <ul style={{ listStyle: 'none', padding: 0 }} className="account-page__account-rows">
            <ListItem
              title={otherName}
              subtitle={accountType === 'business' ? t('account.yourPersonalAccount') : t('account.yourBusinessAccount')}
              media={
                <AvatarView size={48} profileName={otherName} imgSrc={accountType === 'business' ? (avatarUrl || 'https://www.tapback.co/api/avatar/connor-berry.webp') : '/berry-design-logo.png'} />
              }
              control={<ListItem.Navigation onClick={() => onSwitchAccount?.(accountType === 'business' ? 'personal' : 'business')} />}
              spotlight="active"
            />
            <ListItem
              title={t('account.openAnotherBusiness')}
              media={
                <Badge badge={
                  <div className="account-page__plus-badge">
                    <Plus size={16} />
                  </div>
                }>
                  <ListItem.AvatarView size={48} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                    <Briefcase size={24} />
                  </ListItem.AvatarView>
                </Badge>
              }
              control={<ListItem.Navigation onClick={() => {}} />}
              spotlight="inactive"
            />
          </ul>

          {/* Membership + log out */}
          <div className="account-page__sidebar-footer">
            <div className="account-page__membership">
              <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>
                {t('account.membershipNumberFull')}
              </span>
              <span className="account-page__copy-icon" onClick={handleCopyMembership} role="button" tabIndex={0}>
                <Documents size={16} />
              </span>
            </div>

            <Button v2 priority="secondary-neutral" size="sm" onClick={() => {}}>{t('common.logOut')}</Button>
          </div>
        </div>

        {/* Right Column — Menu Sections */}
        <div className="account-page__content">
          <MenuSection title={t('account.yourAccount')} items={YOUR_ACCOUNT_ITEMS} isFirst titleClass="np-text-title-section" />
          <MenuSection title={t('account.settings')} items={accountType === 'business' ? BUSINESS_SETTINGS_ITEMS : SETTINGS_ITEMS} />
          <MenuSection title={t('account.actionsAndAgreements')} items={accountType === 'business' ? getBusinessActionsItems() : ACTIONS_ITEMS} businessName={businessName} />

          {/* Mobile-only: Log out as ListItem */}
          <div className="account-page__mobile-logout">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <ListItem
                title={t('common.logOut')}
                media={
                  <ListItem.AvatarView size={48}>
                    <LogOut size={24} />
                  </ListItem.AvatarView>
                }
                control={<ListItem.Navigation onClick={() => {}} />}
              />
            </ul>
          </div>

          {/* Mobile-only: Membership number */}
          <div className="account-page__mobile-membership">
            <div className="account-page__mobile-membership-row">
              <div>
                <span className="np-text-body-large" style={{ display: 'block', fontWeight: 600 }}>{t('account.membershipNumber')}</span>
                <span className="np-text-body-default" style={{ color: 'var(--color-content-primary)' }}>P73920461</span>
              </div>
              <Button v2 priority="secondary-neutral" size="sm" onClick={handleCopyMembership}>{t('common.copy')}</Button>
            </div>
          </div>

          {/* Footer */}
          <div className="account-page__footer">
            <p className="np-text-body-default" style={{ color: 'var(--color-content-secondary)', margin: '0 0 4px' }}>
              {t('account.changesFooter')}
            </p>
            <a href="#" className="np-text-link-default" onClick={(e) => e.preventDefault()}>
              {t('common.giveFeedback')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
