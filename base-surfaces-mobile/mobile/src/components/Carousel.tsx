import { type ReactNode } from 'react';

export function Carousel({ children }: { children: ReactNode }) {
  return (
    <div className="acct-carousel acct-carousel--mobile">
      <div className="acct-carousel__track acct-carousel__track--mobile">
        {children}
      </div>
    </div>
  );
}
