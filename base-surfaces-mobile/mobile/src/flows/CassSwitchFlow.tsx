import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Field, Input, ListItem, StatusIcon, DateInput, InfoPrompt, IconButton } from '@transferwise/components';
import { ArrowLeft, Cross, Bank, FastFlag, Convert } from '@transferwise/icons';
import { Illustration } from '@wise/art';
import { useLanguage } from '../context/Language';
import { useCass } from '../context/Cass';
import {
  oldBank,
  heldAddress,
  getMinSwitchDate,
  formatSwitchDate,
} from '../data/cass-switch-data';
import './CassSwitchFlow.css';

type Screen =
  | 'intro'
  | 'bank'
  | 'match'
  | 'address'
  | 'card'
  | 'date'
  | 'review'
  | 'finalise'
  | 'success';

const ORDER: Screen[] = ['intro', 'bank', 'match', 'address', 'card', 'date', 'review', 'finalise'];

type Props = {
  onClose: () => void;
  avatarUrl: string;
};

export function CassSwitchFlow({ onClose }: Props) {
  const { t } = useLanguage();
  const { initiateSwitch } = useCass();

  const [screen, setScreen] = useState<Screen>('intro');

  // Step 2 — old bank details + simulated CoP result.
  const [fullName, setFullName] = useState(oldBank.accountHolder);
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [checking, setChecking] = useState(false);

  // Step 5 — last 5 digits of the old debit card.
  const [cardDigits, setCardDigits] = useState('');

  // Step 4 — editable held address.
  const [addressLine, setAddressLine] = useState(heldAddress.line1);
  const [city, setCity] = useState(heldAddress.city);
  const [postcode, setPostcode] = useState(heldAddress.postcode);

  // Step 6 — switch date.
  const minDate = useMemo(() => getMinSwitchDate(), []);
  const [switchDate, setSwitchDate] = useState<Date | null>(minDate);

  const bodyRef = useRef<HTMLDivElement>(null);

  const handleSortCode = useCallback((v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6);
    const formatted = digits.replace(/(\d{2})(?=\d)/g, '$1-');
    setSortCode(formatted);
  }, []);

  const handleAccountNumber = useCallback((v: string) => {
    setAccountNumber(v.replace(/\D/g, '').slice(0, 8));
  }, []);

  const goTo = useCallback((next: Screen) => {
    setScreen(next);
    bodyRef.current?.scrollTo(0, 0);
  }, []);

  const goNext = useCallback(() => {
    const idx = ORDER.indexOf(screen);
    if (idx >= 0 && idx < ORDER.length - 1) goTo(ORDER[idx + 1]);
  }, [screen, goTo]);

  const goBack = useCallback(() => {
    const idx = ORDER.indexOf(screen);
    if (idx > 0) goTo(ORDER[idx - 1]);
    else onClose();
  }, [screen, goTo, onClose]);

  // Bank screen — simulate the Confirmation of Payee check, then reveal the match screen.
  const runCoP = useCallback(() => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      goTo('match');
    }, 1100);
  }, [goTo]);

  const handleDateChange = useCallback((value: string | null) => {
    setSwitchDate(value ? new Date(value) : null);
  }, []);

  const handleSubmit = useCallback(() => {
    initiateSwitch(switchDate ?? minDate);
    setScreen('success');
  }, [initiateSwitch, switchDate, minDate]);

  // Reset transient validation when leaving the bank screen.
  useEffect(() => {
    if (screen !== 'bank') setChecking(false);
  }, [screen]);

  const sortCodeValid = sortCode.replace(/\D/g, '').length === 6;
  const accountValid = accountNumber.length === 8;
  const nameValid = fullName.trim().length > 0;
  const bankValid = nameValid && sortCodeValid && accountValid;
  const cardValid = cardDigits.length === 5;

  const isSuccess = screen === 'success';

  return (
    <div className={`cass-flow${isSuccess ? ' cass-flow--success np-theme-personal--forest-green' : ''}`}>
      <div className="cass-flow__nav">
        {isSuccess ? (
          <IconButton size={40} priority="secondary" aria-label={t('cass.sent.cta')} onClick={onClose}>
            <Cross />
          </IconButton>
        ) : (
          <IconButton size={40} priority="secondary" aria-label={t('topBar.goBack')} onClick={goBack}>
            <ArrowLeft />
          </IconButton>
        )}
      </div>

      <div className="cass-flow__body" ref={bodyRef}>
        {screen === 'intro' && (
          <div className="cass-flow__screen">
            {/* Placeholder for the Current Account Switch logo — to be replaced with the real asset later. */}
            <div className="cass-flow__logo-placeholder" aria-hidden />
            <h1 className="np-text-display-small cass-flow__display-title">{t('cass.intro.title')}</h1>

            <p className="np-text-title-group cass-flow__section-label">{t('cass.intro.whatHappens')}</p>
            <span className="cass-flow__rule" />
            <ul className="wds-list list-unstyled m-y-0">
              <ListItem
                media={<ListItem.AvatarView size={48}><Bank size={24} /></ListItem.AvatarView>}
                title={t('cass.intro.balanceTitle')}
                subtitle={t('cass.intro.balanceBody')}
              />
              <ListItem
                media={<ListItem.AvatarView size={48}><FastFlag size={24} /></ListItem.AvatarView>}
                title={t('cass.intro.debitsTitle')}
                subtitle={t('cass.intro.debitsBody')}
              />
              <ListItem
                media={<ListItem.AvatarView size={48}><Convert size={24} /></ListItem.AvatarView>}
                title={t('cass.intro.redirectTitle')}
                subtitle={t('cass.intro.redirectBody')}
              />
            </ul>
          </div>
        )}

        {screen === 'bank' && (
          <div className="cass-flow__screen">
            <h1 className="np-text-title-screen cass-flow__title">{t('cass.bank.title')}</h1>

            <Field label={t('cass.bank.fullName')}>
              <Input
                type="text"
                placeholder={t('cass.bank.fullNamePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
            <Field label={t('cass.bank.sortCode')}>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="00-00-00"
                value={sortCode}
                onChange={(e) => handleSortCode(e.target.value)}
              />
            </Field>
            <Field label={t('cass.bank.accountNumber')}>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="12345678"
                value={accountNumber}
                onChange={(e) => handleAccountNumber(e.target.value)}
              />
            </Field>
          </div>
        )}

        {screen === 'match' && (
          <div className="cass-flow__screen">
            <div className="cass-flow__hero">
              <Illustration name="check-mark" size="large" />
            </div>
            <h1 className="np-text-title-screen cass-flow__title cass-flow__title--center">{t('cass.match.title')}</h1>

            <ul className="wds-list list-unstyled m-y-0 cass-flow__match-list">
              <ListItem
                title={t('cass.match.holderName')}
                subtitle={oldBank.accountHolder}
                valueTitle={<StatusIcon sentiment="positive" size={24} />}
              />
              <ListItem
                title={t('cass.match.sortCode')}
                subtitle={oldBank.sortCode}
                valueTitle={<StatusIcon sentiment="positive" size={24} />}
              />
              <ListItem
                title={t('cass.match.accountNumber')}
                subtitle={oldBank.accountNumberMasked}
                valueTitle={<StatusIcon sentiment="positive" size={24} />}
              />
              <ListItem
                title={t('cass.match.accountType')}
                subtitle={oldBank.accountType}
                valueTitle={<StatusIcon sentiment="positive" size={24} />}
              />
            </ul>
          </div>
        )}

        {screen === 'address' && (
          <div className="cass-flow__screen">
            <h1 className="np-text-title-screen cass-flow__title">{t('cass.address.title')}</h1>
            <p className="np-text-body-large cass-flow__lede">{t('cass.address.subtitle')}</p>

            <Field label={t('cass.address.homeAddress')}>
              <Input type="text" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
            </Field>
            <Field label={t('cass.address.city')}>
              <Input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label={t('cass.address.postcode')}>
              <Input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </Field>

            <div className="cass-flow__prompt">
              <InfoPrompt
                sentiment="warning"
                title={t('cass.address.warningTitle')}
                description={t('cass.address.warningBody')}
              />
            </div>
          </div>
        )}

        {screen === 'card' && (
          <div className="cass-flow__screen">
            <h1 className="np-text-title-screen cass-flow__title">{t('cass.card.title')}</h1>

            <Field label={t('cass.card.label')}>
              <Input
                type="text"
                inputMode="numeric"
                value={cardDigits}
                onChange={(e) => setCardDigits(e.target.value.replace(/\D/g, '').slice(0, 5))}
              />
            </Field>

            <div className="cass-flow__prompt">
              <InfoPrompt
                sentiment="warning"
                title={t('cass.card.warningTitle')}
                description={t('cass.card.warningBody')}
              />
            </div>
          </div>
        )}

        {screen === 'date' && (
          <div className="cass-flow__screen">
            <h1 className="np-text-title-screen cass-flow__title">{t('cass.date.title')}</h1>
            <p className="np-text-body-large cass-flow__lede">{t('cass.date.hint')}</p>

            <Field label={t('cass.date.fieldLabel')}>
              <DateInput value={switchDate ?? undefined} monthFormat="long" onChange={handleDateChange} />
            </Field>
            <div className="cass-flow__date-hint">
              <StatusIcon sentiment="neutral" size={16} />
              <span className="np-text-body-default">{t('cass.date.firstPossible')}</span>
            </div>
          </div>
        )}

        {screen === 'review' && (
          <div className="cass-flow__screen">
            <h1 className="np-text-title-screen cass-flow__title">{t('cass.review.title')}</h1>
            <p className="np-text-body-large cass-flow__lede">{t('cass.review.subtitle')}</p>

            <ul className="wds-list list-unstyled m-y-0">
              <ListItem title={t('cass.review.guarantee')} control={<ListItem.Navigation onClick={() => {}} />} />
              <ListItem title={t('cass.review.agreement')} control={<ListItem.Navigation onClick={() => {}} />} />
              <ListItem
                title={t('cass.review.closure')}
                subtitle={t('cass.review.closureSub', { bank: oldBank.name, date: formatSwitchDate(switchDate) })}
                control={<ListItem.Navigation onClick={() => {}} />}
              />
            </ul>
          </div>
        )}

        {screen === 'finalise' && (
          <div className="cass-flow__screen">
            <h1 className="np-text-title-screen cass-flow__title">{t('cass.finalise.title')}</h1>

            <ul className="wds-list list-unstyled m-y-0 cass-flow__finalise-list">
              <ListItem
                title={t('cass.finalise.switchingFrom')}
                valueTitle={oldBank.displayName}
                valueColumnWidth={60}
                control={<ListItem.Navigation onClick={() => {}} />}
              />
              <ListItem
                title={t('cass.finalise.switchDate')}
                valueTitle={formatSwitchDate(switchDate)}
                valueColumnWidth={60}
                control={<ListItem.Navigation onClick={() => {}} />}
              />
              <ListItem
                title={t('cass.finalise.whatMoves')}
                valueTitle={t('cass.finalise.whatMovesValue')}
                valueColumnWidth={60}
                control={<ListItem.Navigation onClick={() => {}} />}
              />
            </ul>
          </div>
        )}

        {screen === 'success' && (
          <div className="cass-flow__screen cass-flow__screen--success">
            <Illustration name="check-mark" size="large" />
            <h1 className="np-text-display-medium cass-flow__success-title">{t('cass.sent.title')}</h1>
            <p className="np-text-body-large cass-flow__success-body">
              {t('cass.sent.body', { bank: oldBank.name, date: formatSwitchDate(switchDate) })}
            </p>
          </div>
        )}
      </div>

      <div className="cass-flow__footer">
        {screen === 'intro' && (
          <Button v2 size="lg" priority="primary" block onClick={goNext}>{t('cass.intro.cta')}</Button>
        )}

        {screen === 'bank' && (
          <Button v2 size="lg" priority="primary" block disabled={!bankValid || checking} loading={checking} onClick={runCoP}>
            {t('common.continue')}
          </Button>
        )}

        {screen === 'match' && (
          <Button v2 size="lg" priority="primary" block onClick={goNext}>{t('common.continue')}</Button>
        )}

        {screen === 'address' && (
          <div className="cass-flow__footer-stack">
            <Button v2 size="lg" priority="primary" block onClick={goNext}>{t('common.continue')}</Button>
            <Button v2 size="lg" priority="tertiary" block onClick={goNext}>{t('cass.address.notMyAddress')}</Button>
          </div>
        )}

        {screen === 'card' && (
          <Button v2 size="lg" priority="primary" block disabled={!cardValid} onClick={goNext}>{t('common.continue')}</Button>
        )}

        {screen === 'date' && (
          <Button v2 size="lg" priority="primary" block disabled={!switchDate} onClick={goNext}>{t('common.continue')}</Button>
        )}

        {screen === 'review' && (
          <Button v2 size="lg" priority="primary" block onClick={goNext}>{t('common.continue')}</Button>
        )}

        {screen === 'finalise' && (
          <Button v2 size="lg" priority="primary" block onClick={handleSubmit}>{t('common.continue')}</Button>
        )}

        {screen === 'success' && (
          <Button v2 size="lg" priority="primary" block onClick={onClose}>{t('cass.sent.cta')}</Button>
        )}
      </div>
    </div>
  );
}
