import "server-only";

import { getResellhubDatabase } from "@/lib/mongodb";
import { getStripe } from "@/lib/stripe";
import { ObjectId } from "mongodb";

export async function createPendingOrder({ checkoutSession, product, buyer }) {
  const database = await getResellhubDatabase();
  const now = new Date();

  await database.collection("orders").updateOne(
    { stripeSessionId: checkoutSession.id },
    {
      $setOnInsert: {
        stripeSessionId: checkoutSession.id,
        buyerInfo: {
          userId: buyer.id,
          name: buyer.name,
          email: buyer.email,
        },
        sellerInfo: product.sellerInfo,
        product: {
          productId: product._id.toString(),
          title: product.title,
          image: product.images?.[0] || null,
          price: product.price,
        },
        amountTotal: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        paymentStatus: "unpaid",
        orderStatus: "pending",
        createdAt: now,
      },
      $set: {
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}

export async function fulfillCheckout(sessionId, expectedBuyerId) {
  if (
    typeof sessionId !== "string" ||
    !sessionId.startsWith("cs_") ||
    sessionId.length > 255
  ) {
    throw new Error("Invalid checkout session.");
  }

  const stripe = getStripe();
  const checkoutSession =
    await stripe.checkout.sessions.retrieve(sessionId);

  if (
    expectedBuyerId &&
    checkoutSession.client_reference_id !== expectedBuyerId
  ) {
    throw new Error("This checkout session belongs to another buyer.");
  }

  if (checkoutSession.payment_status !== "paid") {
    return {
      paid: false,
      checkoutSession,
    };
  }

  const productId = checkoutSession.metadata?.productId;
  const database = await getResellhubDatabase();
  const now = new Date();

  await database.collection("orders").updateOne(
    { stripeSessionId: checkoutSession.id },
    {
      $set: {
        paymentIntentId:
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : checkoutSession.payment_intent?.id || null,
        amountTotal: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        paymentStatus: "paid",
        orderStatus: "paid",
        customerDetails: {
          name: checkoutSession.customer_details?.name || null,
          email: checkoutSession.customer_details?.email || null,
          phone: checkoutSession.customer_details?.phone || null,
        },
        paidAt: now,
        updatedAt: now,
      },
    },
  );

  if (ObjectId.isValid(productId)) {
    await database.collection("products").updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          status: "out of stock",
          soldAt: now,
          soldToUserId: checkoutSession.client_reference_id,
        },
      },
    );
  }

  return {
    paid: true,
    checkoutSession,
  };
}

export async function getBuyerOrders(buyerId) {
  const database = await getResellhubDatabase();
  const orders = await database
    .collection("orders")
    .find({ "buyerInfo.userId": buyerId })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();

  return orders.map((order) => ({
    ...order,
    _id: order._id.toString(),
  }));
}
