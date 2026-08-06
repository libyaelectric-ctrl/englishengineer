import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ContentRefreshState {
  refreshKey: number;
  discipline: string | null;
  refreshContent: (newDiscipline?: string) => void;
  setDiscipline: (discipline: string) => void;
}

const ContentRefreshContext = createContext<ContentRefreshState | null>(null);

export const ContentRefreshProvider = ({ children }: { children: ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [discipline, setDiscipline] = useState<string | null>(null);

  const refreshContent = useCallback((newDiscipline?: string) => {
    setRefreshKey((prev) => prev + 1);
    if (newDiscipline) {
      setDiscipline(newDiscipline);
    }
  }, []);

  return (
    <ContentRefreshContext.Provider value={{ refreshKey, discipline, refreshContent, setDiscipline }}>
      {children}
    </ContentRefreshContext.Provider>
  );
};

export const useContentRefresh = (): ContentRefreshState => {
  const context = useContext(ContentRefreshContext);
  if (!context) {
    throw new Error('useContentRefresh must be used within a ContentRefreshProvider');
  }
  return context;
};

export default ContentRefreshContext;