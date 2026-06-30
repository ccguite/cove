import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export async function POST(req: NextRequest) {
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
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const isSeasonalStr = formData.get('isSeasonal') as string;
    const imageFile = formData.get('image') as File | null;

    // Validate inputs
    if (!name || !categoryId || !priceStr) {
      return NextResponse.json({ error: 'Missing required parameters: name, categoryId, or price' }, { status: 400 });
    }

    const price = parseInt(priceStr, 10);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    const isSeasonal = isSeasonalStr === 'true';

    // 4. Handle Image Upload to Supabase Storage
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const uuid = crypto.randomUUID();
      const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `public/menu-items/${uuid}-${cleanFileName}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(storagePath, buffer, {
          contentType: imageFile.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
      }

      // Retrieve public url
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(storagePath);

      imageUrl = publicUrl;
    }

    // 5. Insert row into database
    const { data: newItem, error: insertError } = await supabase
      .from('menu_items')
      .insert({
        name: name.trim(),
        category_id: categoryId,
        description: description ? description.trim() : null,
        price,
        image_url: imageUrl,
        is_available: true,
        is_seasonal: isSeasonal,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: `Failed to create menu item: ${insertError.message}` }, { status: 500 });
    }

    // 6. Purge Next.js static page cache for public menu path
    revalidatePath('/menu');

    return NextResponse.json({ data: newItem });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
