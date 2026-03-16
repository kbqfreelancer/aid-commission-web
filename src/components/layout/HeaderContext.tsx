'use client';

import { createContext, useContext, useState, useCallback } from 'react';

export interface HeaderState {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

type HeaderContextValue = {
  header: HeaderState | null;
  setHeader: (header: HeaderState | null) => void;
  clearHeader: () => void;
};

export const HeaderContext = createContext<HeaderContextValue | null>(null);

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error('useHeader must be used within HeaderProvider');
  return ctx;
}

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeaderState] = useState<HeaderState | null>(null);

  const setHeader = useCallback((h: HeaderState | null) => {
    setHeaderState(h);
  }, []);

  const clearHeader = useCallback(() => {
    setHeaderState(null);
  }, []);

  return (
    <HeaderContext.Provider value={{ header, setHeader, clearHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}
