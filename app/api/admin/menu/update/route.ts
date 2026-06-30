import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export async function PATCH(req: NextRequest) {
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

    // 3. Parse Multipart FormData
    const formData = await req.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const isSeasonalStr = formData.get('isSeasonal') as string;
    const existingImageUrl = formData.get('imageUrl') as string | null;
    const newImageFile = formData.get('image') as File | null;

    // Validate inputs
    if (!id || !name || !categoryId || !priceStr) {
      return NextResponse.json({ error: 'Missing required parameters: id, name, categoryId, or price' }, { status: 400 });
    }

    const price = parseInt(priceStr, 10);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    const isSeasonal = isSeasonalStr === 'true';

    // 4. Fetch the existing item to check for old image URL
    const { data: item, error: fetchError } = await supabase
      .from('menu_items')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    let finalImageUrl = item.image_url;

    // 5. Handle Image Update logic
    if (newImageFile && newImageFile.size > 0) {
      // A: Upload new file
      const uuid = crypto.randomUUID();
      const cleanFileName = newImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `public/menu-items/${uuid}-${cleanFileName}`;

      const arrayBuffer = await newImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(storagePath, buffer, {
          contentType: newImageFile.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(storagePath);

      // Delete old file from storage if it exists
      if (item.image_url) {
        try {
          const parts = item.image_url.split('/menu-images/');
          if (parts.length > 1) {
            const oldStoragePath = decodeURIComponent(parts[1]);
            await supabase.storage.from('menu-images').remove([oldStoragePath]);
          }
        } catch (storageErr) {
          console.error('Failed to clean up old image:', storageErr);
        }
      }

      finalImageUrl = publicUrl;
    } else if (existingImageUrl === 'null' || !existingImageUrl) {
      // B: Image was explicitly removed
      if (item.image_url) {
        try {
          const parts = item.image_url.split('/menu-images/');
          if (parts.length > 1) {
            const oldStoragePath = decodeURIComponent(parts[1]);
            await supabase.storage.from('menu-images').remove([oldStoragePath]);
          }
        } catch (storageErr) {
          console.error('Failed to clean up deleted image:', storageErr);
        }
      }
      finalImageUrl = null;
    }

    // 6. Update database record
    const { data: updatedItem, error: updateError } = await supabase
      .from('menu_items')
      .update({
        name: name.trim(),
        category_id: categoryId,
        description: description ? description.trim() : null,
        price,
        image_url: finalImageUrl,
        is_seasonal: isSeasonal,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: `Failed to update menu item: ${updateError.message}` }, { status: 500 });
    }

    // 7. Purge Next.js static page cache for public menu path
    revalidatePath('/menu');

    return NextResponse.json({ data: updatedItem });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
