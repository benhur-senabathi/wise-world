import { House, CardWise, Recipients, Payments } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import type { TranslationKey } from '../translations/en';
import './MobileNav.css';

const items: { label: string; translationKey: TranslationKey; icon: React.ReactNode; href: string }[] = [
  { label: 'Home', translationKey: 'nav.home', icon: <House size={24} />, href: '/home' },
  { label: 'Cards', translationKey: 'nav.cards', icon: <CardWise size={24} />, href: '/cards' },
  { label: 'Recipients', translationKey: 'nav.recipients', icon: <Recipients size={24} />, href: '/recipients' },
  { label: 'Payments', translationKey: 'nav.payments', icon: <Payments size={24} />, href: '/account/payments' },
];

export function MobileNav({
  activeItem,
  onSelect,
}: {
  activeItem: string;
  onSelect: (label: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="mobile-nav">
      <ul className="mobile-nav__items">
        {items.map(({ label, translationKey, icon, href }) => (
          <li key={label} className="mobile-nav-item">
            <a
              className={`mobile-nav-item__link${activeItem === label ? ' mobile-nav-item__link--active' : ''}`}
              href={href}
              onClick={(e) => { e.preventDefault(); onSelect(label); }}
              aria-current={activeItem === label ? 'page' : undefined}
            >
              <span className="mobile-nav-item__icon">{icon}</span>
              <span className="mobile-nav-item__label">{t(translationKey)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
