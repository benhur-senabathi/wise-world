import { useState, useRef, useEffect, useCallback } from 'react';
import { ListItem, CircularButton } from '@transferwise/components';
import { LiquidGlassSegmentedControl } from '../components/LiquidGlassSegmentedControl';
import { Dial, CardWise, Freeze, List, Cog, PadlockUnlocked, Edit, Limit, Bin, QrCode, Plus, Camera } from '@transferwise/icons';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import { useHapticOnChange, triggerHaptic } from '../hooks/useHaptics';
import { useAllCards, useVisibleAccounts } from '../hooks/useAccountRegistry';

type CardInfo = {
  type: 'physical' | 'digital';
  lastFour: string;
  image: string;
};

function QrCard() {
  return (
    <div className="cards-carousel__qr-card">
      <div className="cards-carousel__qr-icon">
        <QrCode size={24} />
      </div>
      <span className="cards-carousel__qr-corner cards-carousel__qr-corner--tl" />
      <span className="cards-carousel__qr-corner cards-carousel__qr-corner--tr" />
      <span className="cards-carousel__qr-corner cards-carousel__qr-corner--bl" />
      <span className="cards-carousel__qr-corner cards-carousel__qr-corner--br" />
    </div>
  );
}

function CardCarousel({ cards, selectedIndex, onSelect, hasQr }: { cards: CardInfo[]; selectedIndex: number; onSelect: (i: number) => void; hasQr?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalCount = (hasQr ? 1 : 0) + cards.length;
  const lastIndexRef = useRef(selectedIndex);

  const checkIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (!children.length) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(containerCenter - childCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    if (closest !== lastIndexRef.current) {
      lastIndexRef.current = closest;
      triggerHaptic();
    }
    onSelect(closest);
  }, [onSelect]);

  // Use rAF polling during touch for iOS (scroll events are throttled during momentum)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let rafId: number | null = null;
    let polling = false;

    const poll = () => {
      checkIndex();
      if (polling) rafId = requestAnimationFrame(poll);
    };

    const startPolling = () => {
      if (!polling) { polling = true; poll(); }
    };
    const stopPolling = () => {
      polling = false;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      // One final check after scroll settles
      setTimeout(checkIndex, 100);
    };

    // Haptic on touchmove when card changes (direct gesture event for Make compatibility)
    const onTouchMove = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) return;
      const containerCenter = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(containerCenter - childCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      if (closest !== lastIndexRef.current) {
        lastIndexRef.current = closest;
        triggerHaptic();
        onSelect(closest);
      }
    };

    el.addEventListener('touchstart', startPolling, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', stopPolling, { passive: true });
    el.addEventListener('touchcancel', stopPolling, { passive: true });
    // Also listen for scroll events as fallback (desktop)
    el.addEventListener('scroll', checkIndex, { passive: true });

    return () => {
      el.removeEventListener('touchstart', startPolling);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', stopPolling);
      el.removeEventListener('touchcancel', stopPolling);
      el.removeEventListener('scroll', checkIndex);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [checkIndex]);

  // Start scrolled to first real card (skip QR)
  useEffect(() => {
    if (!hasQr) return;
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length < 2) return;
    const target = children[1];
    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    el.scrollLeft = targetCenter - el.clientWidth / 2;
  }, [hasQr]);

  return (
    <div className="cards-carousel">
      <div className="cards-carousel__track" ref={scrollRef}>
        {hasQr && (
          <div className="cards-carousel__card cards-carousel__card--qr" onClick={(e) => {
            triggerHaptic();
            (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }}>
            <QrCard />
          </div>
        )}
        {cards.map((card, i) => (
          <div key={i} className="cards-carousel__card" onClick={(e) => {
            triggerHaptic();
            (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }}>
            <img
              src={card.image}
              alt={`${card.type} card ending ${card.lastFour}`}
              className="cards-carousel__image"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CardActions() {
  const { t } = useLanguage();
  return (
    <div className="cards-page__actions">
      <CircularButton icon={<Dial size={24} />} priority="primary">{t('cards.showPin')}</CircularButton>
      <CircularButton icon={<CardWise size={24} />} priority="primary">{t('cards.cardDetails')}</CircularButton>
      <CircularButton icon={<Freeze size={24} />} priority="primary">{t('cards.freezeCard')}</CircularButton>
    </div>
  );
}

function QrPageContent() {
  const { t } = useLanguage();
  return (
    <>
      <div className="cards-page__actions">
        <CircularButton icon={<Camera size={24} />} priority="primary">{t('cards.scanQrCode')}</CircularButton>
        <CircularButton icon={<Plus size={24} />} priority="primary">{t('cards.importQrCode')}</CircularButton>
      </div>

      <div className="cards-page__qr-info">
        <p className="np-text-body-default" style={{ margin: 0, color: 'var(--color-content-secondary)' }}>
          Scan to pay with a QR code
        </p>
        <img src="/paynow-logo.svg" alt="PayNow" className="cards-page__paynow-logo" />
      </div>

      <div className="cards-page__manage">
        <h3 className="np-text-title-group np-header np-header--group" style={{ margin: 0, padding: '32px 0 8px' }}>
          {t('cards.manageQrPayments')}
        </h3>
        <ul className="wds-list list-unstyled m-y-0">
          <ListItem
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('cards.howDoesThisWork')}</span>}
            media={
              <ListItem.AvatarView size={48}>
                <Cog size={24} />
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        </ul>
      </div>
    </>
  );
}

function ManageCardSection({ card }: { card: CardInfo }) {
  const { t } = useLanguage();
  const items = [
    { icon: <List size={24} />, label: t('cards.viewRecentTx') },
    { icon: <Cog size={24} />, label: t('cards.cardControls') },
    { icon: <PadlockUnlocked size={24} />, label: t('cards.unblockPin') },
    { icon: <Edit size={24} />, label: card.type === 'physical' ? t('cards.cardLabel') : t('cards.editCard') },
    { icon: <Limit size={24} />, label: t('cards.spendingLimits') },
    { icon: <CardWise size={24} />, label: t('cards.replaceCard') },
    ...(card.type === 'digital' ? [{ icon: <Bin size={24} />, label: t('cards.deleteCard') }] : []),
  ];

  return (
    <div className="cards-page__manage">
      <h3 className="np-text-title-group np-header np-header--group" style={{ margin: 0, padding: '24px 0 8px' }}>
        {t('cards.manageCard')}
      </h3>
      <ul className="wds-list list-unstyled m-y-0">
        {items.map((item, i) => (
          <ListItem
            key={i}
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{item.label}</span>}
            media={
              <ListItem.AvatarView size={48}>
                {item.icon}
              </ListItem.AvatarView>
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        ))}
      </ul>
    </div>
  );
}

function TeamCardsView({ participants }: { participants: { name: string; imgSrc: string; cardCount: number }[] }) {
  const { t } = useLanguage();
  return (
    <>
      <h2 className="np-text-title-subsection" style={{ margin: '24px 0 8px' }}>{t('cards.teamCardCount')}</h2>
      <h3 className="np-text-title-group np-header np-header--group" style={{ margin: 0, padding: '8px 0 8px' }}>
        {t('cards.teamMembersWithCards')}
      </h3>
      <ul className="wds-list list-unstyled m-y-0">
        {participants.map((p) => (
          <ListItem
            key={p.name}
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{p.name}</span>}
            subtitle={t('cards.teamCardCount')}
            media={
              <ListItem.AvatarView
                size={48}
                imgSrc={p.imgSrc}
              />
            }
            control={<ListItem.Navigation onClick={() => {}} />}
          />
        ))}
      </ul>
    </>
  );
}

export function Cards({ accountType = 'personal', cardsTab = 'your', onCardsTabChange }: { accountType?: AccountType; cardsTab?: 'your' | 'team'; onCardsTabChange?: (tab: 'your' | 'team') => void } = {}) {
  const { t } = useLanguage();
  const isBusiness = accountType === 'business';
  const registryCards = useAllCards(accountType);
  const visibleAccounts = useVisibleAccounts(accountType);
  const cards: CardInfo[] = registryCards.map((c) => ({ type: c.type, lastFour: c.lastFour, image: c.image }));
  // Team tab: show if any visible account has participantStyle 'team'
  const teamAccounts = visibleAccounts.filter((a) => a.features.participantStyle === 'team' && a.participants.length > 0);
  const hasTeamTab = isBusiness && teamAccounts.length > 0;
  const teamParticipants = teamAccounts.flatMap((a) =>
    a.participants.map((p) => ({ ...p, cardCount: a.getCards(accountType).length }))
  );
  const [selectedIndex, setSelectedIndex] = useState(1); // Start on first real card (after QR)
  useHapticOnChange(selectedIndex);

  const isQr = selectedIndex === 0;
  const currentCard = !isQr ? cards[selectedIndex - 1] : null;
  const showTeam = isBusiness && cardsTab === 'team';

  return (
    <div className="cards-page cards-page--mobile">
      <h1 className="np-text-title-screen" style={{ margin: '0 0 16px' }}>{isQr && !showTeam ? t('cards.payWithQr') : t('cards.title')}</h1>
      {isBusiness && hasTeamTab && (
        <div style={{ marginBottom: 16 }}>
          <LiquidGlassSegmentedControl
            name="cards-tabs"
            segments={[
              { id: 'tab-your', value: 'your', label: t('cards.yourCards') },
              { id: 'tab-team', value: 'team', label: t('cards.teamCards') },
            ]}
            value={cardsTab}
            onChange={(val: string) => onCardsTabChange?.(val as 'your' | 'team')}
          />
        </div>
      )}

      {showTeam ? (
        <TeamCardsView participants={teamParticipants} />
      ) : (
        <>
          <CardCarousel cards={cards} selectedIndex={selectedIndex} onSelect={setSelectedIndex} hasQr />

          {isQr ? (
            <QrPageContent />
          ) : currentCard ? (
            <>
              <div className="cards-page__card-label">
                <span className="np-text-body-large" style={{ fontWeight: 600 }}>
                  {currentCard.type === 'physical' ? t('cards.physical') : t('cards.digitalCard')}
                </span>
                <span className="np-text-body-large" style={{ color: 'var(--color-content-primary)' }}>
                  {' \u2022\u2022\u2022\u2022 '}{currentCard.lastFour}
                </span>
              </div>

              <CardActions />
              <ManageCardSection card={currentCard} />
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
