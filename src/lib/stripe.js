import "server-only";

import Stripe from "stripe";

let stripeClient;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey?.startsWith("sk_")) {
    throw new Error("STRIPE_SECRET_KEY is not configured correctly.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}
