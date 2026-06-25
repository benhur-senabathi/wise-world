import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button, Field, Input, ListItem, StatusIcon, DateLookup, InfoPrompt, InlinePrompt, IconButton, Header } from '@transferwise/components';
import { ArrowLeft, Cross, FastFlag, Convert, Card, CardStrikethrough, DirectDebits, CalendarCheck, Coins, Money, Jar, PercentageCircle } from '@transferwise/icons';
import { Illustration } from '@wise/art';
import { useLanguage } from '../context/Language';
import { useCass } from '../context/Cass';
import { CassSwitchGuaranteeOrbit } from '../components/CassSwitchGuaranteeOrbit';
import { CassFlagPromoCard } from '../components/CassFlagPromoCard';
import { CassCashbackPromoCard } from '../components/CassCashbackPromoCard';
import { PageFooter } from '../components/PageFooter';
import { BottomSheet } from '../components/BottomSheet';
import {
  oldBank,
  heldAddress,
  getMinSwitchDate,
  getMaxSwitchDate,
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

// Staggered screen entrance. The container fades/slides each semantic chunk in
// ~90ms apart; exits are a softer, smaller translate (skill: subtle exits).
const SPRING = { type: 'spring', duration: 0.3, bounce: 0 } as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: SPRING },
  exit: { opacity: 0, y: 8, transition: { duration: 0.16 } },
};

// Pop for the CoP match ticks — exact icon values from the polish skill.
const tickVariants = {
  hidden: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: SPRING },
};

// Per-screen content wrapper. When reduced motion is on, render a plain div so
// nothing animates and content appears instantly.
function ScreenMotion({ reduced, className, children }: { reduced: boolean; className?: string; children: ReactNode }) {
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={containerVariants} initial="hidden" animate="show" exit="exit">
      {children}
    </motion.div>
  );
}

// One staggered chunk inside a ScreenMotion. Plain passthrough under reduced motion.
function Chunk({ reduced, children, className }: { reduced: boolean; children: ReactNode; className?: string }) {
  if (reduced) return <div className={className}>{children}</div>;
  return <motion.div className={className} variants={itemVariants}>{children}</motion.div>;
}

// Match list — a nested stagger container so each verified row reveals in turn.
const matchListVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } },
  exit: {},
};

// One verified CoP row. The row slides in (itemVariants); its green tick then
// pops (scale/blur, slight delay) so each "✓" lands with a beat as the list reveals.
function MatchRow({ reduced, title, subtitle }: { reduced: boolean; title: string; subtitle: string }) {
  if (reduced) {
    return <ListItem title={title} subtitle={subtitle} valueTitle={<StatusIcon sentiment="positive" size={24} />} />;
  }
  const tick = (
    <motion.span style={{ display: 'inline-flex' }} variants={tickVariants}>
      <StatusIcon sentiment="positive" size={24} />
    </motion.span>
  );
  return (
    <motion.li variants={itemVariants} className="list-unstyled">
      <ListItem as="div" title={title} subtitle={subtitle} valueTitle={tick} />
    </motion.li>
  );
}

type Props = {
  onClose: () => void;
  avatarUrl: string;
  startScreen?: Screen;
};

export function CassSwitchFlow({ onClose, startScreen = 'intro' }: Props) {
  const { t } = useLanguage();
  const { initiateSwitch, pauseSwitch } = useCass();
  const reduced = useReducedMotion() ?? false;

  const [screen, setScreen] = useState<Screen>(startScreen);

  // Intro: the orbit owns a full-screen genesis then docks; the rest of the page
  // content holds hidden until the orbit signals the dock is underway. If we don't
  // open on the intro screen (resume), reveal immediately.
  const [introRevealed, setIntroRevealed] = useState(startScreen !== 'intro');

  // Step 2 — old bank details + simulated CoP result.
  const [fullName, setFullName] = useState(oldBank.accountHolder);
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [checking, setChecking] = useState(false);
  const [showMismatchSheet, setShowMismatchSheet] = useState(false);

  // Step 5 — last 5 digits of the old debit card.
  const [cardDigits, setCardDigits] = useState('');
  const [showCardSheet, setShowCardSheet] = useState(false);

  // Step 4 — editable held address.
  const [addressLine, setAddressLine] = useState(heldAddress.line1);
  const [city, setCity] = useState(heldAddress.city);
  const [postcode, setPostcode] = useState(heldAddress.postcode);
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  // Step 6 — switch date.
  const minDate = useMemo(() => getMinSwitchDate(), []);
  const maxDate = useMemo(() => getMaxSwitchDate(), []);
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

  // "Save and continue later" — pause the switch at the current screen so the Home
  // task card can resume from exactly here, then close the flow. 'success' is never
  // reachable from a save action, so the current screen is always a valid resume point.
  const saveAndExit = useCallback(() => {
    if (screen !== 'success') pauseSwitch(screen);
    onClose();
  }, [screen, pauseSwitch, onClose]);

  // Bank screen — simulate the Confirmation of Payee check. Account number 12345679
  // triggers the name-mismatch branch; anything else (incl. 12345678) "succeeds".
  const runCoP = useCallback(() => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (accountNumber === '12345679') {
        setShowMismatchSheet(true);
      } else {
        goTo('match');
      }
    }, 1100);
  }, [goTo, accountNumber]);

  const handleDateChange = useCallback((value: Date | null) => {
    setSwitchDate(value);
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
        {/* The button is always rendered so the nav reserves a constant height —
            hiding it (vs removing it) during the intro genesis keeps the orbit
            alone on screen WITHOUT shifting the body/orbit-slot down when the
            back button later appears. */}
        {isSuccess ? (
          <IconButton size={40} priority="secondary" aria-label={t('cass.sent.cta')} onClick={onClose}>
            <Cross />
          </IconButton>
        ) : (
          <div className={screen === 'intro' && !introRevealed ? 'cass-flow__nav-hidden' : undefined}>
            <IconButton size={40} priority="secondary" aria-label={t('topBar.goBack')} onClick={goBack}>
              <ArrowLeft />
            </IconButton>
          </div>
        )}
      </div>

      <div className="cass-flow__body" ref={bodyRef}>
        <AnimatePresence mode="wait" initial={false}>
          {screen === 'intro' && (
            <div key="intro" className="cass-flow__screen">
              {/* The orbit owns its own genesis + dock; it must render immediately
                  (not as a staggered Chunk) and signals when to reveal the rest. */}
              <CassSwitchGuaranteeOrbit onDockReady={() => setIntroRevealed(true)} />

              {/* Own AnimatePresence so this late mount gets a fresh PresenceContext —
                  the outer AnimatePresence's `initial={false}` would otherwise leak down
                  and suppress the entrance, making the content flash in all at once. */}
              <AnimatePresence>
              {introRevealed && (
                <ScreenMotion reduced={reduced}>
                  <Chunk reduced={reduced}>
                    <h1 className="np-text-display-small cass-flow__display-title">{t('cass.intro.title')}</h1>
                  </Chunk>

                  <Chunk reduced={reduced}>
                    <Header
                      title={t('cass.intro.whatHappens')}
                      level="group"
                      as="h2"
                      action={{ text: t('cass.intro.learnMore'), 'aria-label': t('cass.intro.learnMore'), onClick: () => {} }}
                    />
                    <ul className="wds-list list-unstyled m-y-0">
                      <ListItem
                        media={<ListItem.AvatarView size={48}><Money size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.balanceTitle')}
                        subtitle={t('cass.intro.balanceBody')}
                      />
                      <ListItem
                        media={<ListItem.AvatarView size={48}><Convert size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.debitsTitle')}
                        subtitle={t('cass.intro.debitsBody')}
                      />
                      <ListItem
                        media={<ListItem.AvatarView size={48}><FastFlag size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.redirectTitle')}
                        subtitle={t('cass.intro.redirectBody')}
                      />
                    </ul>
                  </Chunk>

                  <Chunk reduced={reduced} className="cass-flow__promo">
                    <CassCashbackPromoCard title={t('cass.intro.cashbackPromoTitle')} ctaLabel={t('cass.intro.learnMore')} onClick={() => {}} />
                  </Chunk>

                  <Chunk reduced={reduced} className="cass-flow__section">
                    <Header
                      title={t('cass.intro.cashbackInfo')}
                      level="group"
                      as="h2"
                      action={{ text: t('cass.intro.learnMore'), 'aria-label': t('cass.intro.learnMore'), onClick: () => {} }}
                    />
                    <ul className="wds-list list-unstyled m-y-0">
                      <ListItem
                        media={<ListItem.AvatarView size={48}><DirectDebits size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.cashbackEligibleTitle')}
                      />
                      <ListItem
                        media={<ListItem.AvatarView size={48}><CalendarCheck size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.cashbackValidTitle')}
                      />
                      <ListItem
                        media={<ListItem.AvatarView size={48}><Coins size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.cashbackMaxTitle')}
                      />
                    </ul>
                  </Chunk>

                  <Chunk reduced={reduced} className="cass-flow__promo">
                    <CassFlagPromoCard
                      title={t('cass.intro.promoTitle')}
                      description={t('cass.intro.promoDescription')}
                    />
                  </Chunk>

                  <Chunk reduced={reduced} className="cass-flow__section">
                    <Header
                      title={t('cass.intro.whatYouGet')}
                      level="group"
                      as="h2"
                      action={{ text: t('cass.intro.learnMore'), 'aria-label': t('cass.intro.learnMore'), onClick: () => {} }}
                    />
                    <ul className="wds-list list-unstyled m-y-0">
                      <ListItem
                        media={<ListItem.AvatarView size={48}><Jar size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.getJarsTitle')}
                        subtitle={t('cass.intro.getJarsBody')}
                      />
                      <ListItem
                        media={<ListItem.AvatarView size={48}><PercentageCircle size={24} /></ListItem.AvatarView>}
                        title={t('cass.intro.getInterestTitle')}
                        subtitle={t('cass.intro.getInterestBody')}
                      />
                    </ul>
                  </Chunk>

                  <Chunk reduced={reduced} className="cass-flow__footer-reassurance">
                    <PageFooter />
                  </Chunk>
                </ScreenMotion>
              )}
              </AnimatePresence>
            </div>
          )}

          {screen === 'bank' && (
            <ScreenMotion key="bank" reduced={reduced} className="cass-flow__screen">
              <Chunk reduced={reduced}>
                <h1 className="np-text-title-screen cass-flow__title">{t('cass.bank.title')}</h1>
              </Chunk>
              <Chunk reduced={reduced}>
                <p className="np-text-body-large cass-flow__lede">{t('cass.bank.subtitle')}</p>
              </Chunk>

              <Chunk reduced={reduced}>
                <Field label={t('cass.bank.fullName')}>
                  <Input
                    type="text"
                    placeholder={t('cass.bank.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Field>
                <div className="cass-flow__name-prompt">
                  <InlinePrompt sentiment="neutral" width="full">{t('cass.bank.namePrompt')}</InlinePrompt>
                </div>
              </Chunk>
              <Chunk reduced={reduced}>
                <Field label={t('cass.bank.sortCode')}>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="00-00-00"
                    value={sortCode}
                    onChange={(e) => handleSortCode(e.target.value)}
                  />
                </Field>
              </Chunk>
              <Chunk reduced={reduced}>
                <Field label={t('cass.bank.accountNumber')}>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    value={accountNumber}
                    onChange={(e) => handleAccountNumber(e.target.value)}
                  />
                </Field>
              </Chunk>
            </ScreenMotion>
          )}

          {screen === 'match' && (
            <ScreenMotion key="match" reduced={reduced} className="cass-flow__screen">
              <Chunk reduced={reduced} className="cass-flow__hero">
                <Illustration name="check-mark" size="large" />
              </Chunk>
              <Chunk reduced={reduced}>
                <h1 className="np-text-title-screen cass-flow__title cass-flow__title--center">{t('cass.match.title')}</h1>
              </Chunk>

              {reduced ? (
                <ul className="wds-list list-unstyled m-y-0 cass-flow__match-list">
                  <MatchRow reduced={reduced} title={t('cass.match.holderName')} subtitle={oldBank.accountHolder} />
                  <MatchRow reduced={reduced} title={t('cass.match.sortCode')} subtitle={oldBank.sortCode} />
                  <MatchRow reduced={reduced} title={t('cass.match.accountNumber')} subtitle={oldBank.accountNumberMasked} />
                  <MatchRow reduced={reduced} title={t('cass.match.accountType')} subtitle={oldBank.accountType} />
                </ul>
              ) : (
                <motion.ul className="wds-list list-unstyled m-y-0 cass-flow__match-list" variants={matchListVariants}>
                  <MatchRow reduced={reduced} title={t('cass.match.holderName')} subtitle={oldBank.accountHolder} />
                  <MatchRow reduced={reduced} title={t('cass.match.sortCode')} subtitle={oldBank.sortCode} />
                  <MatchRow reduced={reduced} title={t('cass.match.accountNumber')} subtitle={oldBank.accountNumberMasked} />
                  <MatchRow reduced={reduced} title={t('cass.match.accountType')} subtitle={oldBank.accountType} />
                </motion.ul>
              )}
            </ScreenMotion>
          )}

          {screen === 'address' && (
            <ScreenMotion key="address" reduced={reduced} className="cass-flow__screen">
              <Chunk reduced={reduced}>
                <h1 className="np-text-title-screen cass-flow__title">{t('cass.address.title')}</h1>
              </Chunk>
              <Chunk reduced={reduced}>
                <p className="np-text-body-large cass-flow__lede">{t('cass.address.subtitle')}</p>
              </Chunk>

              <Chunk reduced={reduced}>
                <Field label={t('cass.address.homeAddress')}>
                  <Input type="text" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
                </Field>
              </Chunk>
              <Chunk reduced={reduced}>
                <Field label={t('cass.address.city')}>
                  <Input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
              </Chunk>
              <Chunk reduced={reduced}>
                <Field label={t('cass.address.postcode')}>
                  <Input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
                </Field>
              </Chunk>

              <Chunk reduced={reduced} className="cass-flow__prompt">
                <InfoPrompt
                  sentiment="warning"
                  title={t('cass.address.matchTitle')}
                  description={t('cass.address.matchBody')}
                />
              </Chunk>
            </ScreenMotion>
          )}

          {screen === 'card' && (
            <ScreenMotion key="card" reduced={reduced} className="cass-flow__screen">
              <Chunk reduced={reduced}>
                <h1 className="np-text-title-screen cass-flow__title cass-flow__title--form">{t('cass.card.title')}</h1>
              </Chunk>

              <Chunk reduced={reduced}>
                <Field label={t('cass.card.label')}>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={cardDigits}
                    onChange={(e) => setCardDigits(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  />
                </Field>
              </Chunk>

              <Chunk reduced={reduced} className="cass-flow__prompt">
                <InfoPrompt
                  sentiment="warning"
                  title={t('cass.card.warningTitle')}
                  description={t('cass.card.warningBody')}
                />
              </Chunk>
            </ScreenMotion>
          )}

          {screen === 'date' && (
            <ScreenMotion key="date" reduced={reduced} className="cass-flow__screen">
              <Chunk reduced={reduced}>
                <h1 className="np-text-title-screen cass-flow__title">{t('cass.date.title')}</h1>
              </Chunk>
              <Chunk reduced={reduced}>
                <p className="np-text-body-large cass-flow__lede">{t('cass.date.hint')}</p>
              </Chunk>

              <Chunk reduced={reduced}>
                <Field label={t('cass.date.fieldLabel')}>
                  <DateLookup
                    value={switchDate}
                    min={minDate}
                    max={maxDate}
                    monthFormat="long"
                    onChange={handleDateChange}
                  />
                </Field>
                <div className="cass-flow__date-hint">
                  <StatusIcon sentiment="neutral" size={16} />
                  <span className="np-text-body-default">{t('cass.date.firstPossible')}</span>
                </div>
              </Chunk>
            </ScreenMotion>
          )}

          {screen === 'review' && (
            <ScreenMotion key="review" reduced={reduced} className="cass-flow__screen">
              <Chunk reduced={reduced}>
                <h1 className="np-text-title-screen cass-flow__title">{t('cass.review.title')}</h1>
              </Chunk>
              <Chunk reduced={reduced}>
                <p className="np-text-body-large cass-flow__lede">{t('cass.review.subtitle')}</p>
              </Chunk>

              <Chunk reduced={reduced}>
                <ul className="wds-list list-unstyled m-y-0">
                  <ListItem title={t('cass.review.guarantee')} control={<ListItem.Navigation onClick={() => {}} />} />
                  <ListItem title={t('cass.review.agreement')} control={<ListItem.Navigation onClick={() => {}} />} />
                  <ListItem
                    title={t('cass.review.closure')}
                    subtitle={t('cass.review.closureSub', { bank: oldBank.name, date: formatSwitchDate(switchDate) })}
                    control={<ListItem.Navigation onClick={() => {}} />}
                  />
                </ul>
              </Chunk>
            </ScreenMotion>
          )}

          {screen === 'finalise' && (
            <ScreenMotion key="finalise" reduced={reduced} className="cass-flow__screen">
              <Chunk reduced={reduced}>
                <h1 className="np-text-title-screen cass-flow__title">{t('cass.finalise.title')}</h1>
              </Chunk>

              <Chunk reduced={reduced}>
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
              </Chunk>
            </ScreenMotion>
          )}

          {screen === 'success' && (
            <ScreenMotion key="success" reduced={reduced} className="cass-flow__screen cass-flow__screen--success">
              <Chunk reduced={reduced}>
                <Illustration name="check-mark" size="large" />
              </Chunk>
              <Chunk reduced={reduced}>
                <h1 className="np-text-display-medium cass-flow__success-title">{t('cass.sent.title')}</h1>
              </Chunk>
              <Chunk reduced={reduced}>
                <p className="np-text-body-large cass-flow__success-body">
                  {t('cass.sent.body', { bank: oldBank.name, date: formatSwitchDate(switchDate) })}
                </p>
              </Chunk>
            </ScreenMotion>
          )}
        </AnimatePresence>
      </div>

      <div className="cass-flow__footer">
        {screen === 'intro' && introRevealed && (
          <Button v2 size="lg" priority="primary" block onClick={goNext}>{t('cass.intro.cta')}</Button>
        )}

        {screen === 'bank' && (
          <Button v2 size="lg" priority="primary" block disabled={!bankValid || checking} loading={checking} onClick={runCoP}>
            {t('cass.bank.cta')}
          </Button>
        )}

        {screen === 'match' && (
          <Button v2 size="lg" priority="primary" block onClick={goNext}>{t('common.continue')}</Button>
        )}

        {screen === 'address' && (
          <div className="cass-flow__footer-stack">
            <Button v2 size="lg" priority="primary" block onClick={goNext}>{t('common.continue')}</Button>
            <Button v2 size="lg" priority="tertiary" block onClick={() => setShowAddressSheet(true)}>{t('cass.address.notMyAddress')}</Button>
          </div>
        )}

        {screen === 'card' && (
          <div className="cass-flow__footer-stack">
            <Button v2 size="lg" priority="primary" block disabled={!cardValid} onClick={goNext}>{t('common.continue')}</Button>
            <Button v2 size="lg" priority="tertiary" block onClick={() => setShowCardSheet(true)}>{t('cass.card.noCard')}</Button>
          </div>
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

      <BottomSheet
        open={showAddressSheet}
        onClose={() => setShowAddressSheet(false)}
      >
        <div className="cass-flow__mismatch-sheet">
          <div className="cass-flow__hero">
            <Illustration name="house" size="large" />
          </div>
          <h2 className="np-text-title-subsection cass-flow__mismatch-title">{t('cass.address.sheetTitle')}</h2>
          <p className="np-text-body-large cass-flow__mismatch-body">{t('cass.address.sheetBody')}</p>
          <div className="cass-flow__mismatch-sheet-actions">
            <Button v2 size="lg" priority="primary" block onClick={() => setShowAddressSheet(false)}>
              {t('cass.address.sheetCta')}
            </Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={showCardSheet}
        onClose={() => setShowCardSheet(false)}
        title={t('cass.card.sheetTitle')}
      >
        <div className="cass-flow__card-sheet">
          <ul className="wds-list list-unstyled m-y-0">
            <ListItem
              media={<ListItem.AvatarView size={48}><Card size={24} /></ListItem.AvatarView>}
              title={t('cass.card.sheetLostTitle')}
              subtitle={t('cass.card.sheetLostBody')}
            />
            <ListItem
              media={<ListItem.AvatarView size={48}><CardStrikethrough size={24} /></ListItem.AvatarView>}
              title={t('cass.card.sheetSkipTitle')}
              subtitle={t('cass.card.sheetSkipBody')}
            />
          </ul>
          <div className="cass-flow__card-sheet-actions">
            <Button v2 size="lg" priority="primary" block onClick={() => { setShowCardSheet(false); saveAndExit(); }}>
              {t('cass.card.sheetSaveCta')}
            </Button>
            <Button v2 size="lg" priority="secondary" block onClick={() => { setShowCardSheet(false); goNext(); }}>
              {t('cass.card.sheetSkipCta')}
            </Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={showMismatchSheet}
        onClose={() => setShowMismatchSheet(false)}
      >
        <div className="cass-flow__mismatch-sheet">
          <div className="cass-flow__hero">
            <Illustration name="exclamation-mark" size="large" />
          </div>
          <h2 className="np-text-title-subsection cass-flow__mismatch-title">{t('cass.mismatch.title')}</h2>
          <p className="np-text-body-large cass-flow__mismatch-body">{t('cass.mismatch.body')}</p>
          <div className="cass-flow__mismatch-sheet-actions">
            <Button v2 size="lg" priority="primary" block onClick={() => { setShowMismatchSheet(false); goTo('address'); }}>
              {t('cass.mismatch.proceed')}
            </Button>
            <Button v2 size="lg" priority="tertiary" block onClick={() => { setShowMismatchSheet(false); saveAndExit(); }}>
              {t('cass.mismatch.saveLater')}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
