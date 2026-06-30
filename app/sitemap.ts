import { MetadataRoute } from 'next';
import { createSupabasePublicClient } from '@/lib/supabase/serverClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coveaizawl.com';
  const supabase = createSupabasePublicClient();

  // Fetch dynamic room slugs from public rooms table
  const { data: rooms } = await supabase.from('rooms').select('slug');
  
  const roomEntries = (rooms || []).map((room) => ({
    url: `${baseUrl}/rooms/${room.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/menu`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  return [...staticPages, ...roomEntries];
}
