import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createSupabaseStaffServerClient();

    // 1. Authenticate user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // 2. Fetch user profile role from DB
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse and validate payload
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // 4. Fetch the item first to check for storage image
    const { data: item, error: fetchError } = await supabase
      .from('menu_items')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const imageUrl = item.image_url;

    // 5. Delete the database row
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: `Failed to delete menu item: ${deleteError.message}` }, { status: 500 });
    }

    // 6. If DB delete succeeded, clean up storage asset
    if (imageUrl) {
      try {
        const parts = imageUrl.split('/menu-images/');
        if (parts.length > 1) {
          const storagePath = decodeURIComponent(parts[1]);
          const { error: storageDeleteError } = await supabase.storage
            .from('menu-images')
            .remove([storagePath]);

          if (storageDeleteError) {
            console.error(`Failed to delete storage file ${storagePath}:`, storageDeleteError);
          }
        }
      } catch (storageErr) {
        console.error('Storage path extraction error:', storageErr);
      }
    }

    // 7. Purge static page cache for public menu path
    revalidatePath('/menu');

    return NextResponse.json({ data: { id, success: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
