'use client';

import { createContext, useContext } from 'react';
import type { UserRole } from '@/lib/supabase/types';

type DashboardContextValue = { role: UserRole };
export const DashboardContext = createContext<DashboardContextValue>({ role: 'staff' });
export const useDashboard = () => useContext(DashboardContext);
