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

export async function createRazorpayOrder(amountRupees: number, receiptId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.trim() === '' || keySecret.trim() === '') {
    return {
      id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
      amount: Math.round(amountRupees * 100), // convert to paise
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
    };
  }

  const razorpay = getRazorpayInstance();
  const options = {
    amount: Math.round(amountRupees * 100), // convert to paise
    currency: 'INR',
    receipt: receiptId,
  };
  return await razorpay.orders.create(options);
}

