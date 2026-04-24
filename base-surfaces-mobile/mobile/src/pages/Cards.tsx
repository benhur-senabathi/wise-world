import { useState, useRef, useEffect, useCallback } from 'react';
import { ListItem, CircularButton, SegmentedControl } from '@transferwise/components';
import { Dial, CardWise, Freeze, List, Cog, PadlockUnlocked, Edit, Limit, Bin, QrCode, Plus, Camera } from '@transferwise/icons';
import type { AccountType } from '../App';
import { useLanguage } from '../context/Language';
import { useHapticOnChange, triggerHaptic } from '../hooks/useHaptics';

type CardInfo = {
  type: 'physical' | 'digital';
  lastFour: string;
  image: string;
};

const personalCards: CardInfo[] = [
  { type: 'physical', lastFour: '8130', image: '/wise-card-physical.png' },
  { type: 'digital', lastFour: '6663', image: '/wise-card-personal-digital-turquoise.png' },
];

const businessCards: CardInfo[] = [
  { type: 'physical', lastFour: '5271', image: '/wise-card-biz-physical.png' },
  { type: 'digital', lastFour: '9034', image: '/wise-card-biz-digital-aqua.png' },
  { type: 'digital', lastFour: '4219', image: '/wise-card-biz-digital-yellow.png' },
  { type: 'digital', lastFour: '7803', image: '/wise-card-biz-digital-orange.png' },
];

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
          <div className="cards-carousel__card" onClick={(e) => {
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
            {card.type === 'digital' && (
              <svg className="cards-carousel__wise-logo" viewBox="0 0 1340 305" fill="#fff" aria-hidden="true">
                <path d="M746.324 4.55894H828.892L787.355 300.89H704.787L746.324 4.55894ZM642.228 4.55894L586.508 175.266L562.194 4.55894H504.447L431.504 174.759L422.386 4.55894H342.351L370.212 300.89H436.569L518.63 113.467L547.504 300.89H612.849L720.744 4.55894H642.228ZM1335.44 176.786H1139.41C1140.42 215.283 1163.47 240.611 1197.41 240.611C1222.99 240.611 1243.25 226.934 1258.95 200.847L1325.13 230.936C1302.39 275.74 1254.47 304.943 1195.38 304.943C1114.84 304.943 1061.4 250.741 1061.4 163.615C1061.4 67.8782 1124.21 0 1212.86 0C1290.86 0 1340 52.6817 1340 134.742C1340 148.419 1338.48 162.096 1335.44 176.786ZM1261.99 120.052C1261.99 85.607 1242.74 63.8252 1211.84 63.8252C1180.94 63.8252 1153.59 86.6201 1146.5 120.052H1261.99ZM84.2898 93.8636L0 192.362H150.496L167.415 145.912H102.931L142.34 100.347L142.467 99.1317L116.836 55.0366H232.101L142.746 300.89H203.886L311.781 4.55894H33.027L84.2645 93.8636H84.2898ZM963.127 63.8252C992.254 63.8252 1017.78 79.4777 1040.07 106.325L1051.77 22.7947C1031 8.73805 1002.89 0 965.66 0C891.704 0 850.167 43.3102 850.167 98.2705C850.167 136.388 871.442 159.69 906.394 174.759L923.11 182.358C954.263 195.655 962.621 202.24 962.621 216.297C962.621 230.353 948.564 240.104 927.162 240.104C891.831 240.231 863.211 222.122 841.682 191.222L829.753 276.348C854.27 295.039 885.701 304.943 927.162 304.943C997.446 304.943 1040.63 264.418 1040.63 208.192C1040.63 169.947 1023.66 145.38 980.857 126.131L962.621 117.519C937.293 106.249 928.682 100.043 928.682 87.633C928.682 74.2095 940.459 63.8252 963.127 63.8252Z" />
              </svg>
            )}
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

function TeamCardsView() {
  const { t } = useLanguage();
  return (
    <>
      <h2 className="np-text-title-subsection" style={{ margin: '24px 0 8px' }}>{t('cards.teamCardCount')}</h2>
      <h3 className="np-text-title-group np-header np-header--group" style={{ margin: 0, padding: '8px 0 8px' }}>
        {t('cards.teamMembersWithCards')}
      </h3>
      <ul className="wds-list list-unstyled m-y-0">
        <ListItem
          title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('cards.teamMemberName')}</span>}
          subtitle={t('cards.teamCardCount')}
          media={
            <ListItem.AvatarView
              size={48}
              imgSrc="https://www.tapback.co/api/avatar/jamie-reynolds.webp"
            />
          }
          control={<ListItem.Navigation onClick={() => {}} />}
        />
      </ul>
    </>
  );
}

export function Cards({ accountType = 'personal', cardsTab = 'your', onCardsTabChange }: { accountType?: AccountType; cardsTab?: 'your' | 'team'; onCardsTabChange?: (tab: 'your' | 'team') => void } = {}) {
  const { t } = useLanguage();
  const isBusiness = accountType === 'business';
  const cards = isBusiness ? businessCards : personalCards;
  const [selectedIndex, setSelectedIndex] = useState(1); // Start on first real card (after QR)
  useHapticOnChange(selectedIndex);

  const isQr = selectedIndex === 0;
  const currentCard = !isQr ? cards[selectedIndex - 1] : null;
  const showTeam = isBusiness && cardsTab === 'team';

  return (
    <div className="cards-page cards-page--mobile">
      <h1 className="np-text-title-screen" style={{ margin: '0 0 16px' }}>{isQr && !showTeam ? t('cards.payWithQr') : t('cards.title')}</h1>
      {isBusiness && (
        <div style={{ marginBottom: 16 }}>
          <SegmentedControl
            name="cards-tabs"
            mode="input"
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
        <TeamCardsView />
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
