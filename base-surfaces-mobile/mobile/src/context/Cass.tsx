import { createContext, useContext, useState, useCallback } from 'react';
import { initialCassState, type CassState, type CassMilestone } from '../data/cass-switch-data';

type CassContextValue = {
  cass: CassState;
  initiateSwitch: (switchDate: Date) => void;
  advanceMilestone: () => void;
  resetSwitch: () => void;
  dismissEntry: () => void;
};

const CassContext = createContext<CassContextValue>({
  cass: initialCassState,
  initiateSwitch: () => {},
  advanceMilestone: () => {},
  resetSwitch: () => {},
  dismissEntry: () => {},
});

export function CassProvider({ children }: { children: React.ReactNode }) {
  const [cass, setCass] = useState<CassState>(initialCassState);

  const initiateSwitch = useCallback((switchDate: Date) => {
    setCass((prev) => ({ ...prev, status: 'initiated', milestone: 1, switchDate }));
  }, []);

  const advanceMilestone = useCallback(() => {
    setCass((prev) => {
      if (prev.status === 'none') return prev;
      const next = Math.min(prev.milestone + 1, 5) as CassMilestone;
      return { ...prev, milestone: next, status: next === 5 ? 'complete' : 'initiated' };
    });
  }, []);

  const resetSwitch = useCallback(() => {
    setCass(initialCassState);
  }, []);

  const dismissEntry = useCallback(() => {
    setCass((prev) => ({ ...prev, entryDismissed: true }));
  }, []);

  return (
    <CassContext.Provider value={{ cass, initiateSwitch, advanceMilestone, resetSwitch, dismissEntry }}>
      {children}
    </CassContext.Provider>
  );
}

export function useCass() {
  return useContext(CassContext);
}
