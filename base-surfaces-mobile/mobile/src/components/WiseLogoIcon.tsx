import { Savings, Suitcase, Money, People, Heart, Backpack } from '@transferwise/icons';

export function WiseLogoIcon() {
  return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1.875 15.28 7.35 8.838h-.002L4.02 3h18.105l-7.008 19.375h-3.97L16.95 6.3H9.463l1.665 2.883-.008.08-2.56 2.979h4.188l-1.098 3.037z" />
    </svg>
  );
}

export function resolveIcon(iconName: string) {
  switch (iconName) {
    case 'Savings': return <Savings size={16} />;
    case 'Suitcase': return <Suitcase size={16} />;
    case 'Money': return <Money size={16} />;
    case 'People': return <People size={16} />;
    case 'Heart': return <Heart size={16} />;
    case 'Backpack': return <Backpack size={16} />;
    default: return <WiseLogoIcon />;
  }
}
