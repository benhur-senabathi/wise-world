import { useState, useRef, useEffect } from 'react';
import { Button, AvatarView, useSnackbar } from '@transferwise/components';
import { Documents, ChevronDown, ChevronRight, Download, CheckCircleFill, CrossCircleFill } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { useLanguage } from '../context/Language';
import { usePrototypeNames } from '../context/PrototypeNames';
import { getAccountDetails } from '@shared/data/account-details-data';
import type { AccountType } from '../App';
import type { AccountDetailField, QuickFactFee, AvailabilityItem } from '@shared/data/account-details-data';

type Props = {
  code: string;
  accountType?: AccountType;
};

function DetailRow({ field, onCopy }: { field: AccountDetailField; onCopy: (value: string, snackbarKey: string) => void }) {
  const { t } = useLanguage();
  return (
    <div className="account-details__row">
      <div className="account-details__row-content">
        <span className="np-text-body-default account-details__row-label">{t(field.labelKey)}</span>
        <span className="np-text-body-large account-details__row-value">{field.value}</span>
        {field.helperKey && (
          <span className="np-text-caption account-details__row-helper">
            {t(field.helperKey)}
            {field.helperLinkKey && (
              <>{' '}<a href="#" className="np-text-link-caption" onClick={(e) => e.preventDefault()}>{t(field.helperLinkKey)}</a></>
            )}
          </span>
        )}
      </div>
      <button
        type="button"
        className="account-details__copy-btn"
        aria-label={t('common.copy')}
        onClick={() => onCopy(field.value, field.copySnackbarKey)}
      >
        <Documents size={24} />
      </button>
    </div>
  );
}

function FactCard({ rows, showChevron = true }: { rows: QuickFactFee[]; showChevron?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={`account-details__fee-card${showChevron ? ' account-details__fee-card--clickable' : ''}`}>
      {rows.map((row, i) => (
        <div key={i} className="account-details__fee-row">
          <span className="np-text-body-default" style={{ color: 'var(--color-content-secondary)' }}>{t(row.labelKey)}</span>
          <span className="np-text-body-default account-details__fee-value">{t(row.valueKey)}</span>
          {row.helperKey && (
            <span className="np-text-caption" style={{ color: 'var(--color-content-tertiary)' }}>{t(row.helperKey)}</span>
          )}
        </div>
      ))}
      {showChevron && (
        <div className="account-details__fee-chevron">
          <ChevronRight size={16} />
        </div>
      )}
    </div>
  );
}

function QuickFacts({ code, accountType = 'personal' }: { code: string; accountType?: AccountType }) {
  const { t } = useLanguage();
  const details = getAccountDetails(code, accountType);
  const [activeTab, setActiveTab] = useState<'fees' | 'speed' | 'limits'>('fees');

  if (!details) return null;

  return (
    <aside className="account-details__sidebar">
      <h2 className="np-text-title-body" style={{ margin: '0 0 16px' }}>{t('accountDetails.quickFacts')}</h2>

      <div className="account-details__tabs" role="listbox">
        {(['fees', 'speed', 'limits'] as const).map((tab) => (
          <div
            key={tab}
            role="option"
            tabIndex={0}
            aria-selected={activeTab === tab}
            className={`np-chip${activeTab === tab ? ' np-chip--selected' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="np-text-body-default-bold">
              {t(`accountDetails.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}` as any)}
            </span>
          </div>
        ))}
      </div>

      {activeTab === 'fees' && (
        <div className="account-details__facts-content">
          <p className="np-text-body-default" style={{ margin: '0 0 12px', color: 'var(--color-content-secondary)' }}>
            {t('accountDetails.whatDoesItCost')}
          </p>
          <FactCard rows={details.fees} />
        </div>
      )}

      {activeTab === 'speed' && (
        <div className="account-details__facts-content">
          <p className="np-text-body-default" style={{ margin: '0 0 12px', color: 'var(--color-content-secondary)' }}>
            {t('accountDetails.howLongDoesItTake')}
          </p>
          <FactCard rows={details.speeds} />
        </div>
      )}

      {activeTab === 'limits' && (
        <div className="account-details__facts-content">
          <p className="np-text-body-default" style={{ margin: '0 0 12px', color: 'var(--color-content-secondary)' }}>
            {t('accountDetails.whatAreTheLimits')}
          </p>
          <FactCard rows={details.limits} showChevron={false} />
        </div>
      )}

      {details.availability.length > 0 && (
        <div className="account-details__availability">
          <h3 className="np-text-title-body" style={{ margin: '0 0 12px' }}>{t('accountDetails.availability')}</h3>
          {details.availability.map((item, i) => (
            <div key={i} className="account-details__availability-card">
              <span style={{ color: item.type === 'positive' ? 'var(--color-sentiment-positive)' : 'var(--color-sentiment-negative)', flexShrink: 0, display: 'flex' }}>
                {item.type === 'positive' ? <CheckCircleFill size={16} /> : <CrossCircleFill size={16} />}
              </span>
              <div>
                <span className="np-text-body-default" style={{ fontWeight: 600, display: 'block', color: 'var(--color-content-primary)' }}>{t(item.titleKey)}</span>
                {item.subtitleKey && <span className="np-text-caption" style={{ color: 'var(--color-content-secondary)' }}>{t(item.subtitleKey)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function ShareDropdown({ shareOpen, setShareOpen, shareRef, onCopyAll, onGetProof }: {
  shareOpen: boolean;
  setShareOpen: (v: boolean) => void;
  shareRef: React.RefObject<HTMLDivElement>;
  onCopyAll: () => void;
  onGetProof: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div ref={shareRef} style={{ position: 'relative' }}>
      <div onMouseDown={(e) => { e.stopPropagation(); setShareOpen(!shareOpen); }}>
        <Button
          v2
          size="sm"
          priority="primary"
          addonEnd={{ type: 'icon', value: (
            <span className={`action-button-row__chevron${shareOpen ? ' action-button-row__chevron--open' : ''}`}>
              <ChevronDown size={16} />
            </span>
          )}}
        >
          {t('accountDetails.share')}
        </Button>
      </div>
      {shareOpen && (
        <div className="action-button-row__panel" style={{ right: 0, left: 'auto' }}>
          <div className="np-panel__content">
            <ul className="action-button-row__dropdown" style={{ width: 220 }}>
              <li>
                <a
                  className="action-button-row__dropdown-item"
                  href="#"
                  onClick={(e) => { e.preventDefault(); onCopyAll(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <span style={{ display: 'flex', flexShrink: 0 }}><Documents size={16} /></span>
                  {t('accountDetails.copyAllDetails')}
                </a>
              </li>
              <li>
                <a
                  className="action-button-row__dropdown-item"
                  href="#"
                  onClick={(e) => { e.preventDefault(); onGetProof(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <span style={{ display: 'flex', flexShrink: 0 }}><Download size={16} /></span>
                  {t('accountDetails.getProofOfOwnership')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function AccountDetailsPage({ code, accountType = 'personal' }: Props) {
  const { t } = useLanguage();
  const { consumerName, businessName } = usePrototypeNames();
  const createSnackbar = useSnackbar();
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null!);

  const activeName = accountType === 'business' ? businessName : consumerName;
  const details = getAccountDetails(code, accountType);

  useEffect(() => {
    if (!shareOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareOpen]);

  const handleCopy = (value: string, snackbarKey: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    createSnackbar({ text: t(snackbarKey as any) } as any);
  };

  const handleCopyAll = () => {
    if (!details) return;
    const allFields = details.fields(activeName);
    const allText = allFields.map((f) => `${t(f.labelKey)}: ${f.value}`).join('\n');
    navigator.clipboard.writeText(allText).catch(() => {});
    createSnackbar({ text: t('accountDetails.allDetailsCopied') } as any);
    setShareOpen(false);
  };

  if (!details) {
    return <div className="np-text-body-default">{t('accountDetails.notAvailable')}</div>;
  }

  const fields = details.fields(activeName);

  const receiveSection = (
    <div className="account-details-page__receive-header">
      <div style={{ flex: 1 }}>
        <h2 className="np-text-title-subsection" style={{ margin: 0 }}>{t('accountDetails.receive', { code })}</h2>
        <p className="np-text-body-default" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>
          {t(details.receiveSubtitleKey)}{' '}
          <a href="#" className="np-text-link-default" onClick={(e) => e.preventDefault()}>{t(details.countriesLinkKey)}</a>
        </p>
      </div>
      <ShareDropdown
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        shareRef={shareRef}
        onCopyAll={handleCopyAll}
        onGetProof={() => setShareOpen(false)}
      />
    </div>
  );

  const detailsCard = (
    <div className="account-details__card">
      {fields.map((field, i) => (
        <DetailRow key={i} field={field} onCopy={handleCopy} />
      ))}
    </div>
  );

  const footer = (
    <p className="np-text-body-default" style={{ margin: '20px 0 0', color: 'var(--color-content-secondary)' }}>
      {t('accountDetails.detailsNotAccepted')}{' '}
      <a href="#" className="np-text-link-default" onClick={(e) => e.preventDefault()}>{t('accountDetails.tellUsWhere')}</a>
      {'  '}or{'  '}
      <a href="#" className="np-text-link-default" onClick={(e) => e.preventDefault()}>{t('common.giveFeedback').toLowerCase()}</a>
    </p>
  );

  return (
    <div className="account-details-page">
      {/* Header */}
      <div className="account-details-page__header">
        <AvatarView size={48}>
          <Flag code={code} />
        </AvatarView>
        <div>
          <h1 className="np-text-title-screen" style={{ margin: 0 }}>{code}</h1>
          <p className="np-text-body-large" style={{ margin: 0, color: 'var(--color-content-default)' }}>{t('common.accountDetails')}</p>
        </div>
      </div>

      {/* Desktop: two-column layout */}
      <div className="account-details-page__desktop">
        <div className="account-details-page__main">
          {receiveSection}
          {detailsCard}
          {footer}
        </div>
        <QuickFacts code={code} accountType={accountType} />
      </div>

      {/* Mobile: stacked layout */}
      <div className="account-details-page__mobile">
        <div className="account-details-page__main">
          {receiveSection}
          {detailsCard}
        </div>
        <QuickFacts code={code} accountType={accountType} />
        <div style={{ textAlign: 'center' }}>{footer}</div>
      </div>
    </div>
  );
}
