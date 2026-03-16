'use client';

import { createContext, useContext } from 'react';
import type { User } from '@/types';

const ServerUserContext = createContext<User | null>(null);

export function useServerUser() {
  return useContext(ServerUserContext);
}

export function ServerUserProvider({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <ServerUserContext.Provider value={user}>
      {children}
    </ServerUserContext.Provider>
  );
}
