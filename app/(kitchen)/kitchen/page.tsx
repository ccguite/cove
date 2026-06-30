import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import { getActiveOrders } from '@/lib/orders/orderService';
import OrdersQueueClient from '../../(dashboard)/dashboard/orders/OrdersQueueClient';

export const metadata = { title: 'Kitchen Queue — COVE Kitchen' };

export default async function KitchenOrdersPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', session.user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'kitchen')) {
    redirect('/staff/login?error=unauthorized');
  }

  let initialOrders: any[] = [];
  try { initialOrders = await getActiveOrders(); } catch {}

  return (
    <div>
      <div className="dashboard-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="dashboard-page-title">Kitchen Queue</h2>
          <p className="dashboard-page-subtitle">
            Live order feed — updates automatically in real time.
          </p>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: '#E8F5E9',
          color: '#2E7D32',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>wifi</span>
          Live
        </span>
      </div>
      <OrdersQueueClient initialOrders={initialOrders} canUpdateStatus={true} />
    </div>
  );
}
