import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { PromoCard } from '@transferwise/components';
import flagRiv from '@animations/rive_flag.riv';
import { ProgressiveBlur } from './ProgressiveBlur';
import './CassFlagPromoCard.css';

type Props = {
  title: string;
  description: string;
};

export function CassFlagPromoCard({ title, description }: Props) {
  const { RiveComponent } = useRive({
    src: flagRiv,
    artboard: 'FlagCardBG',
    stateMachines: 'CardBG',
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  });

  return (
    <div className="cass-flag-promo">
      <div className="cass-flag-promo__bg" aria-hidden="true">
        <RiveComponent className="cass-flag-promo__rive" />
      </div>
      <ProgressiveBlur
        className="cass-flag-promo__blur"
        direction="bottom"
        blurLayers={8}
        blurIntensity={0.6}
      />
      <PromoCard
        className="cass-flag-promo__card"
        title={title}
        description={description}
        imageAlt=""
      />
    </div>
  );
}
