import { ShimmerButton } from './Shimmer';

/** ActionButtonRow: row of pill buttons */
export function ShimmerActionButtonRow() {
  return (
    <div className="shimmer-action-button-row">
      <ShimmerButton width={72} height={40} />
      <ShimmerButton width={104} height={40} />
      <ShimmerButton width={88} height={40} />
    </div>
  );
}

