import { fulfillCheckout } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json(
      { message: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  let event;

  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Invalid Stripe webhook:", error);
    return Response.json(
      { message: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      await fulfillCheckout(event.data.object.id);
    } catch (error) {
      console.error("Unable to fulfill Stripe Checkout:", error);
      return Response.json(
        { message: "Checkout fulfillment failed." },
        { status: 500 },
      );
    }
  }

  return Response.json({ received: true });
}
