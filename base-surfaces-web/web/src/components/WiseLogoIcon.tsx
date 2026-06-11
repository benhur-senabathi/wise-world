import { Savings, Suitcase, Money, People, Heart, Backpack, FastFlag } from '@transferwise/icons';

export function WiseLogoIcon({ size = 24 }: { size?: number } = {}) {
  return <FastFlag size={size} />;
}

export function resolveIcon(iconName: string, size: number = 24) {
  switch (iconName) {
    case 'Savings': return <Savings size={size} />;
    case 'Suitcase': return <Suitcase size={size} />;
    case 'Money': return <Money size={size} />;
    case 'People': return <People size={size} />;
    case 'Heart': return <Heart size={size} />;
    case 'Backpack': return <Backpack size={size} />;
    case 'WiseLogo':
    case 'Wise':
    default: return <FastFlag size={size} />;
  }
}
