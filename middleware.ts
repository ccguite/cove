import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Role constants — must match public.users.role constraint
const STAFF_ROLES = new Set(['admin', 'reception', 'kitchen']);
const ADMIN_ONLY_ROLES = new Set(['admin']);
const RECEPTION_ROLES = new Set(['admin', 'reception']);
const KITCHEN_ROLES = new Set(['admin', 'kitchen']);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const { pathname } = request.nextUrl;
  const isStaffPath = pathname.startsWith('/admin') || pathname.startsWith('/reception') || pathname.startsWith('/kitchen') || pathname.startsWith('/staff') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/staff') || pathname.startsWith('/api/reception') || pathname.startsWith('/api/kitchen');
  const cookieName = isStaffPath ? 'sb-staff-auth-token' : 'sb-customer-auth-token';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
      cookieOptions: {
        name: cookieName,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Helper to build a redirect response
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  // Fetch role once if authenticated to simplify authorization checks
  let role = '';
  if (session) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      role = profile?.role ?? '';
    } catch {}
  }

  // Self-healing: If a staff session is active in the customer cookie on a customer path, clear it.
  if (session && STAFF_ROLES.has(role) && !isStaffPath) {
    const nextResponse = NextResponse.redirect(request.url);
    nextResponse.cookies.set({
      name: 'sb-customer-auth-token',
      value: '',
      path: '/',
      expires: new Date(0),
    });
    return nextResponse;
  }

  // ─────────────────────────────────────────────────────────────────
  // 1. /staff/login  — staff-only portal
  //    If already authenticated as staff → send to their dashboard
  //    If authenticated as customer → block (they must use /login)
  // ─────────────────────────────────────────────────────────────────
  if (pathname === '/staff/login') {
    if (session) {
      if (role === 'admin') return redirectTo('/admin');
      if (role === 'reception') return redirectTo('/reception');
      if (role === 'kitchen') return redirectTo('/kitchen');
      // Authenticated customer visiting staff portal → send home
      return redirectTo('/');
    }
    return response;
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. /login & /register — customer portal
  //    If authenticated as staff → send to their dashboard
  // ─────────────────────────────────────────────────────────────────
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      if (role === 'admin') return redirectTo('/admin');
      if (role === 'reception') return redirectTo('/reception');
      if (role === 'kitchen') return redirectTo('/kitchen');
      // If customer is already logged in, redirect to home
      if (role === 'customer' || !role) {
        return redirectTo('/');
      }
    }
    return response;
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. /admin/*  — Super Admin only
  // ─────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!session) return redirectTo('/staff/login?next=' + pathname);
    if (!ADMIN_ONLY_ROLES.has(role)) {
      return redirectTo('/staff/login?error=unauthorized');
    }
    return response;
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. /reception/*  — Reception and Admin
  // ─────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/reception')) {
    if (!session) return redirectTo('/staff/login?next=' + pathname);
    if (!RECEPTION_ROLES.has(role)) {
      return redirectTo('/staff/login?error=unauthorized');
    }
    return response;
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. /kitchen/*  — Kitchen and Admin
  // ─────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/kitchen')) {
    if (!session) return redirectTo('/staff/login?next=' + pathname);
    if (!KITCHEN_ROLES.has(role)) {
      return redirectTo('/staff/login?error=unauthorized');
    }
    return response;
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. /book, /cart, /account — customers only
  //    Staff visiting these are redirected to their own dashboard
  // ─────────────────────────────────────────────────────────────────
  const customerRoutes = ['/book', '/cart', '/account'];
  if (customerRoutes.some(r => pathname.startsWith(r))) {
    if (!session) {
      return redirectTo('/login?next=' + pathname);
    }
    if (STAFF_ROLES.has(role)) {
      if (role === 'admin') return redirectTo('/admin');
      if (role === 'reception') return redirectTo('/reception');
      return redirectTo('/kitchen');
    }
    return response;
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. Legacy /dashboard/* — redirect to new role-appropriate URL
  // ─────────────────────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!session) return redirectTo('/staff/login?next=/admin');
    // Map old sub-paths to new ones
    const sub = pathname.replace('/dashboard', '') || '';
    if (role === 'admin') return redirectTo('/admin' + sub);
    if (role === 'reception') {
      const receptionSubs = ['/orders', '/bookings', '/status', ''];
      const allowed = receptionSubs.find(s => sub === s || sub.startsWith(s + '/'));
      return redirectTo('/reception' + (allowed ? sub : ''));
    }
    if (role === 'kitchen') return redirectTo('/kitchen');
    return redirectTo('/login');
  }

  return response;
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/staff/:path*',
    '/admin/:path*',
    '/reception/:path*',
    '/kitchen/:path*',
    '/book/:path*',
    '/cart/:path*',
    '/account/:path*',
    '/dashboard/:path*',
    '/dashboard',
  ],
};
