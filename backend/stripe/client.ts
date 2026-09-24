import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key && !key.includes('placeholder') && !key.includes('your_key')) {
      stripePromise = loadStripe(key);
    } else {
      stripePromise = Promise.resolve(null);
    }
  }
  return stripePromise;
}
