import { useState, useMemo } from 'react';
import { Chips, ListItem, Button, IconButton } from '@transferwise/components';
import { Search, Plus, ScanSparkle } from '@transferwise/icons';
import type { AccountType } from '../App';
import { RecentContactCard } from '../components/RecentContactCard';

import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage } from '../context/Language';
import { recipients, businessRecipients, recentContacts, businessRecentContacts, getAvatarSrc, getBadge, type Recipient } from '@shared/data/recipients';

const PROFILE_AVATAR = 'https://www.tapback.co/api/avatar/connor-berry.webp';
const BUSINESS_AVATAR = '/berry-design-logo.png';

export function Recipients({ accountType = 'personal', onSelectRecipient }: { accountType?: AccountType; onSelectRecipient?: (r: Recipient) => void } = {}) {
  const { consumerName } = usePrototypeNames();
  const { t } = useLanguage();

  const filterChips = useMemo(() => [
    { value: 'all', label: t('recipients.filterAll') },
    { value: 'my-accounts', label: t('recipients.filterMyAccounts') },
  ], [t]);

  const dynamicBusinessRecipients = useMemo(() =>
    businessRecipients.map((r) => r.id === 104 ? { ...r, name: consumerName } : r),
    [consumerName],
  );
  const dynamicBusinessRecentContacts = useMemo(() =>
    businessRecentContacts.map((c) => c.name === 'Connor Berry' ? { ...c, name: consumerName } : c),
    [consumerName],
  );

  const activeRecipients = accountType === 'business' ? dynamicBusinessRecipients : recipients;
  const activeRecentContacts = accountType === 'business' ? dynamicBusinessRecentContacts : recentContacts;
  const profileAvatar = accountType === 'business' ? BUSINESS_AVATAR : PROFILE_AVATAR;
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredRecipients = useMemo(() => {
    let filtered = activeRecipients;

    if (selectedFilter === 'my-accounts') {
      filtered = filtered.filter((r) => r.isMyAccount);
    }

    return filtered;
  }, [selectedFilter, activeRecipients]);

  return (
    <div className="recipients-page">
      {/* Header */}
      <div className="recipients-page__header">
        <h1 className="np-text-title-screen" style={{ margin: 0 }}>{t('recipients.title')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
            <Button v2 size="md" priority="primary" addonStart={{ type: 'icon', value: <Plus size={16} /> }} onClick={() => {}}>{t('common.add')}</Button>
            <IconButton size={40} priority="secondary" aria-label={t('recipients.upload')} onClick={() => {}}><ScanSparkle size={24} /></IconButton>
          </div>
      </div>

      {/* Recent Contacts */}
      <div className="recipients-page__recent">
        <p className="np-text-title-group" style={{ margin: '0 0 8px' }}>{t('recipients.recents')}</p>
        <div className="recipients-page__recent-scroll">
          {activeRecentContacts.slice(0, 6).map((contact, i) => (
            <RecentContactCard
              key={i}
              name={contact.name}
              subtitle={contact.subtitle}
              imgSrc={contact.imgSrc}
              initials={contact.initials}
              badge={contact.badge}
              onClick={onSelectRecipient ? () => {
                const match = activeRecipients.find((r) => r.name === contact.name && r.subtitle === contact.subtitle);
                if (match) onSelectRecipient(match);
              } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="recipients-page__filter">
        <Chips
          chips={filterChips}
          selected={selectedFilter}
          onChange={({ selectedValue }: { isEnabled: boolean; selectedValue: string | number }) => setSelectedFilter(String(selectedValue))}
        />
        <div className="recipients-page__filter-spacer" />
        <Button v2 size="sm" priority="secondary-neutral" addonStart={{ type: 'icon', value: <Search size={16} /> }} onClick={() => {}}>{t('recipients.search')}</Button>
      </div>

      {/* Recipient List */}
      {filteredRecipients.length > 0 ? (
        <ul className="recipients-page__list">
          {filteredRecipients.map((r) => {
            const badge = getBadge(r);

            let imgSrc: string | undefined;
            let avatarChildren: string | undefined;

            if (r.isMyAccount) {
              imgSrc = profileAvatar;
            } else if (r.avatarType === 'photo') {
              imgSrc = getAvatarSrc(r);
            } else {
              avatarChildren = r.initials;
            }

            const avatarMedia = avatarChildren !== undefined ? (
              <ListItem.AvatarView key={r.id} size={48} badge={badge} style={{ backgroundColor: 'var(--color-background-neutral)', border: 'none' }}>
                {avatarChildren}
              </ListItem.AvatarView>
            ) : (
              <ListItem.AvatarView key={r.id} size={48} imgSrc={imgSrc} profileName={r.name} badge={badge} />
            );

            return (
              <ListItem
                key={r.id}
                title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{r.name}</span>}
                subtitle={r.subtitle}
                media={avatarMedia}
                control={<ListItem.Navigation onClick={() => onSelectRecipient?.(r)} />}
              />
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
