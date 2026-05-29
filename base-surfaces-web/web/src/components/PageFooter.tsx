import { Button } from '@transferwise/components';
import { Shield } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import './PageFooter.css';

export function PageFooter() {
  const { t } = useLanguage();

  return (
    <div className="page-footer">
      <div className="page-footer__title" style={{ color: 'var(--color-interactive-primary)' }}>
        <span style={{ lineHeight: 0 }}>
          <Shield size={24} />
        </span>
        <span className="np-text-body-large-bold">{t('footer.title')}</span>
      </div>
      <p className="np-text-body-default page-footer__description">
        {t('footer.subtitle')}
      </p>
      <Button v2 size="sm" priority="secondary">{t('common.learnMore')}</Button>
    </div>
  );
}
