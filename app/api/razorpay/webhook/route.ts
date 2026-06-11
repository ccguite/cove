import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { verifyRazorpaySignature } from '@/lib/razorpay/webhookVerifier';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
    }

    // 1. Signature check
    const isValid = verifyRazorpaySignature(rawBody, signature, secret);
    if (!isValid) {
      return NextResponse.json({ error: 'Signature validation failed' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // 2. Handle Payment Capture Event
    if (event === 'payment.captured') {
      const rpOrderId = payload.payload.payment.entity.order_id;
      const supabase = createSupabaseServiceClient();

      // Retrieve matching pending booking
      const { data: booking, error: fetchErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('razorpay_order_id', rpOrderId)
        .eq('status', 'pending_payment')
        .single();

      if (fetchErr || !booking) {
        return NextResponse.json({ error: 'Matching pending booking not found' }, { status: 404 });
      }

      // Confirm reservation
      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);

      if (updateErr) {
        throw new Error(`Failed to confirm booking: ${updateErr.message}`);
      }

      // Release active slot locks
      await supabase
        .from('slot_locks')
        .delete()
        .eq('room_id', booking.room_id)
        .eq('date', booking.date)
        .eq('start_time', booking.start_time);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook error' }, { status: 500 });
  }
}
