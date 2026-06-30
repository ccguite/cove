import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

export interface ReportKPIs {
  totalRevenueAllTime: number;
  mtdRevenue: number;
  totalBookingsCount: number;
  totalOrdersCount: number;
}

export interface DailyLedgerRow {
  date: string;
  bookingsCount: number;
  bookingsRevenue: number;
  ordersCount: number;
  ordersRevenue: number;
  totalRevenue: number;
}

/**
 * Aggregates all revenue, bookings, and standalone orders statistics server-side.
 */
export async function getRevenueReportData(): Promise<{ kpis: ReportKPIs; ledger: DailyLedgerRow[] }> {
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Fetch bookings
  const { data: bookings, error: bookingsErr } = await supabase
    .from('bookings')
    .select('created_at, total_price, status')
    .eq('status', 'confirmed');

  if (bookingsErr) {
    throw new Error(`Failed to fetch bookings for reports: ${bookingsErr.message}`);
  }

  // 2. Fetch orders
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('created_at, total_price, status')
    .in('status', ['placed', 'preparing', 'ready', 'dispatched', 'collected']);

  if (ordersErr) {
    throw new Error(`Failed to fetch orders for reports: ${ordersErr.message}`);
  }

  const safeBookings = bookings || [];
  const safeOrders = orders || [];

  // Compute KPIs
  const totalBookingsCount = safeBookings.length;
  const totalOrdersCount = safeOrders.length;
  
  const totalBookingsRevenue = safeBookings.reduce((sum, b) => sum + b.total_price, 0);
  const totalOrdersRevenue = safeOrders.reduce((sum, o) => sum + o.total_price, 0);
  const totalRevenueAllTime = totalBookingsRevenue + totalOrdersRevenue;

  // Month-to-Date Calculations
  const mtdBookings = safeBookings.filter(b => b.created_at >= startOfMonth);
  const mtdOrders = safeOrders.filter(o => o.created_at >= startOfMonth);
  const mtdRevenue = mtdBookings.reduce((sum, b) => sum + b.total_price, 0) + 
                     mtdOrders.reduce((sum, o) => sum + o.total_price, 0);

  // Compile Daily Ledger for current month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const ledgerMap = new Map<string, DailyLedgerRow>();

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    ledgerMap.set(dayStr, {
      date: dayStr,
      bookingsCount: 0,
      bookingsRevenue: 0,
      ordersCount: 0,
      ordersRevenue: 0,
      totalRevenue: 0
    });
  }

  // Populate ledger data
  safeBookings.forEach(b => {
    const dateKey = b.created_at.split('T')[0];
    if (ledgerMap.has(dateKey)) {
      const row = ledgerMap.get(dateKey)!;
      row.bookingsCount += 1;
      row.bookingsRevenue += b.total_price;
      row.totalRevenue += b.total_price;
    }
  });

  safeOrders.forEach(o => {
    const dateKey = o.created_at.split('T')[0];
    if (ledgerMap.has(dateKey)) {
      const row = ledgerMap.get(dateKey)!;
      row.ordersCount += 1;
      row.ordersRevenue += o.total_price;
      row.totalRevenue += o.total_price;
    }
  });

  const ledger = Array.from(ledgerMap.values()).reverse(); // Newest first

  return {
    kpis: {
      totalRevenueAllTime,
      mtdRevenue,
      totalBookingsCount,
      totalOrdersCount
    },
    ledger
  };
}
