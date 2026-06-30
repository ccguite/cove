import React from 'react';
import RealtimeNotificationWrapper from './RealtimeNotificationWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeNotificationWrapper>
      {children}
    </RealtimeNotificationWrapper>
  );
}
