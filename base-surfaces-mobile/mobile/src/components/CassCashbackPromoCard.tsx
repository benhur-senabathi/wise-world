import { Button } from '@transferwise/components';
import picnicPhoto from '../assets/cass-cashback-picnic.jpg';
import './CassCashbackPromoCard.css';

type Props = {
  title: string;
  ctaLabel: string;
  onClick?: () => void;
};

export function CassCashbackPromoCard({ title, ctaLabel, onClick }: Props) {
  return (
    <div className="cass-cashback-promo">
      <div className="cass-cashback-promo__bg" aria-hidden="true">
        <img src={picnicPhoto} alt="" />
        <div className="cass-cashback-promo__scrim" />
      </div>
      <div className="cass-cashback-promo__title">
        <h3 className="np-text-display-small">{title}</h3>
      </div>
      <div className="cass-cashback-promo__cta">
        <Button v2 size="md" priority="secondary" onClick={onClick}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
