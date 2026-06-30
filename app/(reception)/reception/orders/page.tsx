import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import { getActiveOrders } from '@/lib/orders/orderService';
import OrdersQueueClient from '../../../(dashboard)/dashboard/orders/OrdersQueueClient';

export const metadata = { title: 'Café Orders — COVE Reception' };

export default async function ReceptionOrdersPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'reception')) {
    redirect('/staff/login?error=unauthorized');
  }

  let initialOrders: any[] = [];
  try { initialOrders = await getActiveOrders(); } catch {}

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Café Orders</h2>
        <p className="dashboard-page-subtitle">View live order status for takeaway and delivery orders.</p>
      </div>
      <OrdersQueueClient initialOrders={initialOrders} canUpdateStatus={false} />
    </div>
  );
}
