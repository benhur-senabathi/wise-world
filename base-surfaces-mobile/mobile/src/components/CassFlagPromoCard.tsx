import { useRive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/react-webgl2';
import { PromoCard } from '@transferwise/components';
import flagRiv from '@animations/rive_flag.riv';
import riveWasmUrl from '@rive-app/webgl2/rive.wasm?url';
import { ProgressiveBlur } from './ProgressiveBlur';
import './CassFlagPromoCard.css';

// Serve the Rive WASM from our own bundle instead of the default unpkg CDN,
// which is unreliable behind corporate networks. Without this the canvas
// mounts but never paints.
RuntimeLoader.setWasmUrl(riveWasmUrl);

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
    onLoad: () => console.log('[CassFlagPromoCard] Rive loaded: FlagCardBG / CardBG'),
    onLoadError: (e) => console.error('[CassFlagPromoCard] Rive failed to load', e),
  });

  return (
    <div className="cass-flag-promo">
      <div className="cass-flag-promo__bg" aria-hidden="true">
        <RiveComponent className="cass-flag-promo__rive" />
      </div>
      <ProgressiveBlur
        className="cass-flag-promo__blur"
        direction="top"
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
