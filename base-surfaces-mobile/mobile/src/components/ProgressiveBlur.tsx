import './ProgressiveBlur.css';

const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
} as const;

type Props = {
  /** Edge the blur builds towards. The strongest blur sits at this edge. */
  direction?: keyof typeof GRADIENT_ANGLES;
  /** Number of stacked mask layers — more layers = smoother falloff. */
  blurLayers?: number;
  /** Per-layer blur step in px. Layer N blurs at N * blurIntensity. */
  blurIntensity?: number;
  className?: string;
};

/**
 * A stack of mask-clipped backdrop-filter layers that ramps blur from clear to
 * heavy across one edge. Unlike a single blur, the staggered masks avoid a hard
 * seam. Always on (no hover) — needed on mobile where there's no hover state.
 */
export function ProgressiveBlur({
  direction = 'bottom',
  blurLayers = 8,
  blurIntensity = 0.5,
  className,
}: Props) {
  const layers = Math.max(blurLayers, 2);
  const segmentSize = 1 / (layers + 1);
  const angle = GRADIENT_ANGLES[direction];

  return (
    <div className={`progressive-blur${className ? ` ${className}` : ''}`}>
      {Array.from({ length: layers }).map((_, index) => {
        const gradient = `linear-gradient(${angle}deg, ${[
          index * segmentSize,
          (index + 1) * segmentSize,
          (index + 2) * segmentSize,
          (index + 3) * segmentSize,
        ]
          .map(
            (pos, posIndex) =>
              `rgba(255, 255, 255, ${posIndex === 1 || posIndex === 2 ? 1 : 0}) ${pos * 100}%`,
          )
          .join(', ')}`;

        return (
          <div
            key={index}
            className="progressive-blur__layer"
            style={{
              maskImage: gradient,
              WebkitMaskImage: gradient,
              backdropFilter: `blur(${index * blurIntensity}px)`,
              WebkitBackdropFilter: `blur(${index * blurIntensity}px)`,
            }}
          />
        );
      })}
    </div>
  );
}
