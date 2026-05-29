import { IconButton } from '@transferwise/components';
import { Plus } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import './EmptyAccountCard.css';

export function EmptyAccountCard() {
  const { t } = useLanguage();

  return (
    <article className="mca mca--empty">
      <div className="mca-cards__stack mca-cards__stack--empty">
        <div className="mca-cards__empty-card" />
      </div>
      <div className="mca-front">
        <div className="mca-front__cutout">
          <svg width="330" height="16" viewBox="0 0 330 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <g clipPath="url(#cutout-clip-empty)">
              <path d="M322 0C326.418 0 330 3.58172 330 8C330 12.4183 326.418 16 322 16H8C3.58172 16 0 12.4183 0 8C2.49657e-07 3.58172 3.58172 0 8 0H126.806C134.929 0 142.144 4.72959 148.943 9.1743C153.622 12.2329 159.148 14 165.067 14C170.987 13.9999 176.513 12.2328 181.191 9.17433C187.99 4.72955 195.204 0 203.327 0H322Z" fill="currentColor" />
              <rect width="16" height="16" fill="currentColor" />
              <rect width="16" height="16" x="314" fill="currentColor" />
            </g>
            <defs>
              <clipPath id="cutout-clip-empty">
                <rect width="330" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="empty-account-card__content">
          <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('emptyAccount.title')}</h3>
          <div className="np-text-body-large" style={{ color: 'var(--color-content-secondary)', marginTop: 4, marginBottom: 16 }}>
            {t('emptyAccount.subtitle')}
          </div>
          <IconButton
            size={56}
            priority="primary"
            aria-label={t('emptyAccount.ariaLabel')}
          >
            <Plus size={24} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}
