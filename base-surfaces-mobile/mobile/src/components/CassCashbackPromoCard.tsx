import { PromoCard } from '@transferwise/components';
import { Illustration } from '@wise/art';
import './CassCashbackPromoCard.css';

type Props = {
  title: string;
  onClick?: () => void;
};

export function CassCashbackPromoCard({ title, onClick }: Props) {
  return (
    <div className="cass-cashback-promo">
      <PromoCard
        className="cass-cashback-promo__card"
        title={title}
        description=""
        indicatorIcon="arrow"
        onClick={onClick}
        imageAlt=""
      />
      <div className="cass-cashback-promo__art" aria-hidden="true">
        <Illustration name="coin-pile-up" size="large" />
      </div>
    </div>
  );
}
