'use client';

import React, { createContext, useContext, useState, useSyncExternalStore } from 'react';
import { CloseAction, dispatch, getServerSnapshot, getSnapshot, subscribe } from './store';
import { USERS } from './model';

type ContextValue = {
  state: ReturnType<typeof getSnapshot>;
  user: typeof USERS[number];
  setUserId: (id: string) => void;
  period: string;
  setPeriod: (period: string) => void;
  act: (action: CloseAction) => boolean;
  toast: { message: string; error: boolean } | null;
};

const Context = createContext<ContextValue | null>(null);

export function CloseProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [userId, setUserId] = useState('chief');
  const [period, setPeriod] = useState(() => getServerSnapshot().periods[0]);
  const [toast, setToast] = useState<ContextValue['toast']>(null);
  const user = USERS.find(item => item.id === userId) ?? USERS[0];

  const act = (action: CloseAction) => {
    const error = dispatch(user.id, action);
    setToast({ message: error || 'Đã lưu thay đổi và ghi nhật ký.', error: Boolean(error) });
    return !error;
  };

  return <Context.Provider value={{ state, user, setUserId, period: state.periods.includes(period) ? period : state.periods[0], setPeriod, act, toast }}>{children}</Context.Provider>;
}

export function useClose() {
  const context = useContext(Context);
  if (!context) throw new Error('useClose cần CloseProvider');
  return context;
}
