import { useState, useMemo } from 'react';
import { ListItem, Button, SearchInput, Size } from '@transferwise/components';
import { usePrototypeNames } from '../context/PrototypeNames';
import { useLanguage } from '../context/Language';

export function Team({ personalAvatarUrl }: { personalAvatarUrl?: string } = {}) {
  const { consumerName } = usePrototypeNames();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const teamMembers = useMemo(() => [
    {
      name: consumerName,
      email: 'connor@berrydesign.co',
      imgSrc: personalAvatarUrl || 'https://www.tapback.co/api/avatar/connor-berry.webp',
      isYou: true,
      role: t('team.accountOwner'),
    },
    {
      name: 'Jamie Reynolds',
      email: 'jamie@berrydesign.co',
      imgSrc: 'https://www.tapback.co/api/avatar/jamie-reynolds.webp',
    },
  ], [consumerName, t, personalAvatarUrl]);

  const isSearching = search.length >= 2;
  const filtered = isSearching
    ? teamMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()),
      )
    : teamMembers;

  return (
    <div className="team-page">
      <div className="team-page__header">
        <h1 className="np-text-title-screen" style={{ margin: 0 }}>{t('team.title')}</h1>
      </div>

      <div className="team-page__actions-row">
        <div className="team-page__actions">
          <Button v2 size="sm" priority="primary" onClick={() => {}}>{t('team.addTeamMember')}</Button>
          <Button v2 size="sm" priority="tertiary" onClick={() => {}}>{t('team.paymentApprovals')}</Button>
          <span className="team-page__expense-spacer"><Button v2 size="sm" priority="tertiary" onClick={() => {}}>{t('team.expenseReminders')}</Button></span>
        </div>
        <div className="team-page__search">
          <SearchInput
            placeholder={t('team.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size={Size.SMALL}
          />
        </div>
      </div>

      <h5 className="np-text-title-group np-header np-header--group p-y-2" style={{ margin: 0 }}>
        {t('team.activeMembers', { count: filtered.length })}
      </h5>

      <ul className="wds-list list-unstyled team-page__members">
        {filtered.map((member) => (
          <ListItem
            key={member.email}
            title={
              <span className="team-page__member-title">
                <span className="np-text-body-large" style={{ fontWeight: 600 }}>{member.name}</span>
                {member.isYou && (
                  <span className="team-page__pill team-page__pill--you">{t('team.you')}</span>
                )}
                {member.role && (
                  <span className="team-page__pill team-page__pill--role">{member.role}</span>
                )}
              </span>
            }
            subtitle={member.email}
            media={
              <ListItem.AvatarView size={48} imgSrc={member.imgSrc} style={{ border: 'none' }} />
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="np-text-body-default" style={{ fontWeight: 600, color: 'var(--color-content-primary)', margin: '24px 0' }}>
          {t('team.noMembersFound')}
        </p>
      )}

      <div className="team-page__footer">
        <p className="np-text-body-default" style={{ color: 'var(--color-content-secondary)', margin: 0 }}>
          {t('team.feedbackQuestion')}
        </p>
        <a href="#" className="np-text-link-default" onClick={(e) => e.preventDefault()}>
          {t('common.giveFeedback')}
        </a>
      </div>
    </div>
  );
}
