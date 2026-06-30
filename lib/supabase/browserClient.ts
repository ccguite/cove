import { createBrowserClient } from '@supabase/ssr';

let customerClientInstance: ReturnType<typeof createBrowserClient> | null = null;
let staffClientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  const path = window.location.pathname;
  const isStaff = path.startsWith('/admin') || path.startsWith('/reception') || path.startsWith('/kitchen') || path.startsWith('/staff');

  if (isStaff) {
    if (!staffClientInstance) {
      staffClientInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: 'sb-staff-auth-token',
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          },
          auth: {
            storageKey: 'sb-staff-auth-token',
            persistSession: true,
            detectSessionInUrl: true,
          }
        }
      );
    }
    return staffClientInstance;
  } else {
    if (!customerClientInstance) {
      customerClientInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: 'sb-customer-auth-token',
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          },
          auth: {
            storageKey: 'sb-customer-auth-token',
            persistSession: true,
            detectSessionInUrl: true,
          }
        }
      );
    }
    return customerClientInstance;
  }
}
