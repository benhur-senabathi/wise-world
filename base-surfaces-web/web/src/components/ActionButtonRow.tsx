import { useState, useRef, useEffect } from 'react';
import { Button } from '@transferwise/components';
import { ChevronDown } from '@transferwise/icons';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import { useShimmer } from '../context/Shimmer';
import { ShimmerActionButtonRow } from './Shimmer';

export function ActionButtonRow({ accountType = 'personal', onAddMoney, onSend, onRequest, onPaymentLink }: { accountType?: AccountType; onAddMoney?: () => void; onSend?: () => void; onRequest?: () => void; onPaymentLink?: () => void } = {}) {
  const { t } = useLanguage();
  const { shimmerMode } = useShimmer();
  const [requestOpen, setRequestOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!requestOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRequestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [requestOpen]);

  if (shimmerMode) return (
    <div className="action-button-row">
      <div className="action-button-row__scroll">
        <ShimmerActionButtonRow />
      </div>
    </div>
  );

  const isBusiness = accountType === 'business';

  return (
    <div className="action-button-row">
      <div className="action-button-row__scroll">
        <Button v2 size="md" priority="primary" onClick={onSend}>{t('common.send')}</Button>
        <Button v2 size="md" priority="secondary" onClick={onAddMoney}>{t('common.addMoney')}</Button>
        <div className="action-button-row__request" ref={dropdownRef}>
          <Button
            v2
            size="md"
            priority="secondary"
            addonEnd={{ type: 'icon', value: (
              <span className={`action-button-row__chevron${requestOpen ? ' action-button-row__chevron--open' : ''}`}>
                <ChevronDown size={16} />
              </span>
            )}}
            onClick={() => setRequestOpen(!requestOpen)}
          >
            {isBusiness ? t('common.getPaid') : t('common.request')}
          </Button>
          {requestOpen && (
            <div className="action-button-row__panel">
              <div className="np-panel__content">
                <ul className="action-button-row__dropdown">
                  {isBusiness ? (
                    <>
                      <li>
                        <a
                          className="action-button-row__dropdown-item"
                          href="#"
                          onClick={(e) => { e.preventDefault(); setRequestOpen(false); onPaymentLink?.(); }}
                        >
                          {t('actions.sharePaymentLink')}
                        </a>
                      </li>
                      <li>
                        <a
                          className="action-button-row__dropdown-item"
                          href="#"
                          onClick={(e) => { e.preventDefault(); setRequestOpen(false); }}
                        >
                          {t('actions.createInvoice')}
                        </a>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <a
                          className="action-button-row__dropdown-item"
                          href="#"
                          onClick={(e) => { e.preventDefault(); setRequestOpen(false); onRequest?.(); }}
                        >
                          {t('actions.requestPayment')}
                        </a>
                      </li>
                      <li>
                        <a
                          className="action-button-row__dropdown-item"
                          href="#"
                          onClick={(e) => { e.preventDefault(); setRequestOpen(false); }}
                        >
                          {t('actions.splitBill')}
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
        {!isBusiness && (
          <Button v2 size="md" priority="secondary">{t('actions.upload')}</Button>
        )}
        {isBusiness && (
          <Button v2 size="md" priority="secondary">{t('actions.payInvoice')}</Button>
        )}
      </div>
    </div>
  );
}
