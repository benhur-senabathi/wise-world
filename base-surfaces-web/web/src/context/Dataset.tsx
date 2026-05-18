import { createContext, useContext, useState, useCallback } from 'react';

export type DatasetType = 'power' | 'common' | 'connor';

type DatasetContextValue = {
  dataset: DatasetType;
  setDataset: (d: DatasetType) => void;
};

const VALID_DATASETS: DatasetType[] = ['power', 'common', 'connor'];

const DatasetContext = createContext<DatasetContextValue>({ dataset: 'power', setDataset: () => {} });

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDatasetRaw] = useState<DatasetType>(() => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get('dataset');
    if (val && VALID_DATASETS.includes(val as DatasetType)) {
      return val as DatasetType;
    }
    return 'power';
  });

  const setDataset = useCallback((d: DatasetType) => setDatasetRaw(d), []);

  return (
    <DatasetContext.Provider value={{ dataset, setDataset }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
