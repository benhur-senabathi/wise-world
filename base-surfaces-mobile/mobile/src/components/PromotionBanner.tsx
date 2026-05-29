import { type ReactNode, useRef } from 'react';
import { ArrowRight, Cross } from '@transferwise/icons';
import { useShimmer } from '../context/Shimmer';
import { ShimmerPromotionBanner } from './PromotionBanner.shimmer';
import { triggerHaptic } from '../hooks/useHaptics';
import './PromotionBanner.css';

type Props = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  illustration?: ReactNode;
  ctaLabel?: string;
  disclaimer?: string;
  href?: string;
  onDismiss?: () => void;
};

export function PromotionBanner({ title, subtitle, backgroundImage, backgroundColor = 'var(--color-forest-green, #163300)', illustration, ctaLabel, disclaimer, href = '#', onDismiss }: Props) {
  const { shimmerMode } = useShimmer();

  if (shimmerMode) return <ShimmerPromotionBanner />;

  return (
    <div className="promotion-banner">
      <div
        className="promotion-banner__pressable"
        onTouchStart={(e) => {
          if ((e.target as HTMLElement).closest('.promotion-banner__dismiss')) return;
          triggerHaptic();
          const el = e.currentTarget;
          el.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
          el.style.transform = 'scale(0.95)';
        }}
        onTouchEnd={(e) => {
          const el = e.currentTarget;
          el.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)';
          el.style.transform = 'scale(1)';
        }}
        onTouchCancel={(e) => {
          const el = e.currentTarget;
          el.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)';
          el.style.transform = 'scale(1)';
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') return;
          if ((e.target as HTMLElement).closest('.promotion-banner__dismiss')) return;
          triggerHaptic();
          const el = e.currentTarget;
          el.style.transition = 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)';
          el.style.transform = 'scale(0.95)';
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'touch') return;
          const el = e.currentTarget;
          el.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)';
          el.style.transform = 'scale(1)';
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'touch') return;
          const el = e.currentTarget;
          el.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)';
          el.style.transform = 'scale(1)';
        }}
      >
        <div
          className="promotion-banner__container"
          tabIndex={0}
          role="button"
          style={{
            backgroundColor,
            ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
          }}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('.promotion-banner__dismiss')) return;
            triggerHaptic();
            e.preventDefault();
          }}
        >
          <div className="promotion-banner__gradient">
            <div className="promotion-banner__text">
              <h2 className="np-display np-text-display-small promotion-banner__title">{title}</h2>
              {/* Forced white: text sits on a dark background image, must stay white in both themes */}
              {subtitle && <div className="np-text-body-large-bold" style={{ color: 'white' }}>{subtitle}</div>}
            </div>
            {illustration && (
              <div className="promotion-banner__illustration">
                {illustration}
              </div>
            )}
            <div className="promotion-banner__foreground" />
            <div className="promotion-banner__actions">
              {ctaLabel && (
                <button type="button" className="promotion-banner__cta">{ctaLabel}</button>
              )}
              <div className="promotion-banner__arrow">
                <ArrowRight size={24} />
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="promotion-banner__dismiss"
          aria-label={`Dismiss "${title}"`}
          onClick={onDismiss}
        >
          <Cross size={16} />
        </button>
      </div>
      {disclaimer && (
        <p className="np-text-body-default promotion-banner__disclaimer">{disclaimer}</p>
      )}
    </div>
  );
}
