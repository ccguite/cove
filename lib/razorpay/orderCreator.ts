import Razorpay from 'razorpay';

export function getRazorpayInstance(): Razorpay {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured in environment variables.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Creates an order in Razorpay.
 * Amount is converted from Rupees to Paise (multiplied by 100).
 */
export async function createRazorpayOrder(amountRupees: number, receiptId: string) {
  const razorpay = getRazorpayInstance();
  const options = {
    amount: Math.round(amountRupees * 100), // convert to paise
    currency: 'INR',
    receipt: receiptId,
  };
  return await razorpay.orders.create(options);
}
