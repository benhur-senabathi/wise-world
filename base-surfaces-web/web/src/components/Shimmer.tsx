import './Shimmer.css';
/**
 * Shimmer skeleton primitives and composites.
 *
 * All elements use the `.shimmer-el` base class which provides:
 *   - neutral background
 *   - overflow: hidden + position: relative
 *   - ::after pseudo with translating white-highlight gradient (1.6s ease-in-out infinite)
 *
 * Composites mirror the layout of real components so they can be swapped in as loading placeholders.
 */

/* ======== Primitives ======== */

export function ShimmerCircle({ size = 48 }: { size?: number }) {
  return <div className="shimmer-el" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />;
}

export function ShimmerBar({ width = 120, height = 12 }: { width?: number | string; height?: number }) {
  return <div className="shimmer-el" style={{ width, height, borderRadius: height / 2, flexShrink: 0 }} />;
}

export function ShimmerRect({ width = '100%', height = 48, borderRadius = 12 }: { width?: number | string; height?: number; borderRadius?: number }) {
  return <div className="shimmer-el" style={{ width, height, borderRadius, flexShrink: 0 }} />;
}

/* ======== DS Component Composites ======== */

export function ShimmerListItem({ hasValue = false, hasNavigation = true }: { hasValue?: boolean; hasNavigation?: boolean } = {}) {
  return (
    <div className="shimmer-list-item">
      <ShimmerCircle size={48} />
      <div className="shimmer-list-item__body">
        <ShimmerBar width={96} height={12} />
        <ShimmerBar width={148} height={10} />
      </div>
      {hasValue && (
        <div className="shimmer-list-item__value">
          <ShimmerBar width={64} height={12} />
          <ShimmerBar width={48} height={10} />
        </div>
      )}
      {hasNavigation && <ShimmerBar width={16} height={16} />}
    </div>
  );
}

export function ShimmerActivitySummary() {
  return <ShimmerListItem hasValue hasNavigation />;
}

export function ShimmerButton({ width = 88, height = 40 }: { width?: number; height?: number } = {}) {
  return <ShimmerRect width={width} height={height} borderRadius={20} />;
}

export function ShimmerCircularButton() {
  return (
    <div className="shimmer-circular-button">
      <ShimmerCircle size={48} />
      <ShimmerBar width={40} height={10} />
    </div>
  );
}

export function ShimmerSearchInput() {
  return <ShimmerRect width="100%" height={48} borderRadius={12} />;
}

export function ShimmerMoneyInput() {
  return (
    <div className="shimmer-money-input">
      <ShimmerBar width={120} height={14} />
      <div className="shimmer-money-input__row">
        <ShimmerBar width={180} height={32} />
        <ShimmerRect width={100} height={40} borderRadius={20} />
      </div>
    </div>
  );
}

export function ShimmerChips({ count = 3 }: { count?: number } = {}) {
  return (
    <div className="shimmer-chips">
      {Array.from({ length: count }, (_, i) => (
        <ShimmerRect key={i} width={64 + i * 12} height={32} borderRadius={16} />
      ))}
    </div>
  );
}

export function ShimmerSegmentedControl({ segments = 3 }: { segments?: number } = {}) {
  return (
    <div className="shimmer-segmented-control">
      {Array.from({ length: segments }, (_, i) => (
        <ShimmerRect key={i} width={`${100 / segments}%`} height={36} borderRadius={8} />
      ))}
    </div>
  );
}

export function ShimmerTabs({ count = 3 }: { count?: number } = {}) {
  return (
    <div className="shimmer-tabs">
      {Array.from({ length: count }, (_, i) => (
        <ShimmerBar key={i} width={64 + i * 8} height={14} />
      ))}
    </div>
  );
}

export function ShimmerTableRow() {
  return (
    <div className="shimmer-table-row">
      <ShimmerBar width={72} height={12} />
      <div className="shimmer-table-row__detail">
        <ShimmerCircle size={32} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ShimmerBar width={120} height={12} />
          <ShimmerBar width={80} height={10} />
        </div>
      </div>
      <ShimmerBar width={24} height={12} />
      <ShimmerBar width={72} height={12} />
    </div>
  );
}

export function ShimmerIconButton({ size = 32 }: { size?: number } = {}) {
  return <ShimmerCircle size={size} />;
}

export function ShimmerBadge({ size = 48 }: { size?: number } = {}) {
  return (
    <div className="shimmer-badge" style={{ width: size, height: size }}>
      <ShimmerCircle size={size} />
      <div className="shimmer-badge__pip" style={{ width: size * 0.375, height: size * 0.375 }} />
    </div>
  );
}

export function ShimmerSectionHeader() {
  return (
    <div style={{ padding: '16px 0 8px' }}>
      <ShimmerBar width={100} height={12} />
    </div>
  );
}
