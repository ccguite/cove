import { NextRequest, NextResponse } from 'next/server';
import { isWithinDeliveryRadius } from '@/lib/delivery/radiusCheck';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { neighborhoodId } = body;

    if (!neighborhoodId) {
      return NextResponse.json({ error: 'Missing neighborhoodId parameter' }, { status: 400 });
    }

    const { isValid, distanceKm } = isWithinDeliveryRadius(neighborhoodId);

    return NextResponse.json({
      data: {
        isValid,
        distanceKm
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
