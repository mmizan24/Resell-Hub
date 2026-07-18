import "server-only";

import { getResellhubDatabase } from "@/lib/mongodb";
import { markProductSold } from "@/lib/product-service";
import { getStripe } from "@/lib/stripe";
import { ObjectId } from "mongodb";

const backendBaseUrl = (process.env.API_URL?.trim() || "http://127.0.0.1:5000").replace(/\/$/, "");
const backendApiBase = `${backendBaseUrl}/api`;

function buildBackendUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendApiBase}${normalizedPath}`;
}

async function readBackendJson(response) {
  const data = await response.json().catch(() => null);
  return data;
}

async function requestBackend(path, options = {}) {
  const response = await fetch(buildBackendUrl(path), {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await readBackendJson(response);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "The payment service is unavailable.";
    throw new Error(message);
  }

  return payload;
}

export const ORDER_STATUS_FLOW = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
];

export function normalizeOrderStatus(status) {
  const value = typeof status === "string" ? status.trim().toLowerCase() : "";

  if (value === "paid") {
    return "pending";
  }

  return ORDER_STATUS_FLOW.includes(value) ? value : "pending";
}

export function canAdvanceOrderStatus(currentStatus, nextStatus) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(normalizeOrderStatus(currentStatus));
  const nextIndex = ORDER_STATUS_FLOW.indexOf(normalizeOrderStatus(nextStatus));

  if (currentIndex === -1 || nextIndex === -1) {
    return false;
  }

  return nextIndex === currentIndex + 1;
}

function buildStatusHistoryEntry(status, actorRole = "system") {
  return {
    status: normalizeOrderStatus(status),
    actorRole,
    at: new Date(),
  };
}

function normalizeQuantity(value, fallback = 1) {
  const quantity = Number.parseInt(value, 10);
  if (Number.isInteger(quantity) && quantity > 0 && quantity <= 999) {
    return quantity;
  }

  return fallback;
}

function normalizePaymentStatus(status) {
  const value = typeof status === "string" ? status.trim().toLowerCase() : "";
  if (["paid", "pending", "unpaid", "failed", "refunded", "cancelled"].includes(value)) {
    return value;
  }
  return "paid";
}

function formatMonthKey(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function monthKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

async function savePaymentRecordOnBackend(paymentRecord) {
  const remote = await requestBackend("/payments/stripe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentRecord),
  });

  return remote?.data || null;
}

export async function createPendingOrder({ checkoutSession, product, buyer, quantity = 1 }) {
  const database = await getResellhubDatabase();
  const now = new Date();
  const orderQuantity = normalizeQuantity(quantity, 1);

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
          quantity: orderQuantity,
        },
        quantity: orderQuantity,
        amountTotal: checkoutSession.amount_total,
        currency: checkoutSession.currency,
        paymentStatus: "unpaid",
        orderStatus: "pending",
        statusHistory: [buildStatusHistoryEntry("pending")],
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
  const quantity = normalizeQuantity(checkoutSession.metadata?.quantity, 1);
  const now = new Date();
  const orderId = checkoutSession.metadata?.orderId || checkoutSession.id;
  const transactionId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id || checkoutSession.id;

  const database = await getResellhubDatabase();
  const existingOrder = await database.collection("orders").findOne({
    stripeSessionId: checkoutSession.id,
  });
  const orderSource = existingOrder || null;
  const buyerInfo =
    orderSource?.buyerInfo || {
      userId: checkoutSession.client_reference_id || checkoutSession.metadata?.buyerId || "",
      name: checkoutSession.customer_details?.name || null,
      email: checkoutSession.customer_details?.email || null,
    };
  const sellerInfo =
    orderSource?.sellerInfo || {
      userId: checkoutSession.metadata?.sellerId || "",
      name: null,
      email: null,
      phone: null,
    };
  const productInfo =
    orderSource?.product || {
      productId: productId || "",
      title: checkoutSession.metadata?.productTitle || "Purchased product",
      price: orderSource?.product?.price || Math.round((Number(checkoutSession.amount_total || 0) / Math.max(1, quantity)) || 0),
      quantity,
    };

  const orderUpdate = {
    paymentIntentId: transactionId,
    amountTotal: checkoutSession.amount_total,
    currency: checkoutSession.currency,
    paymentStatus: "paid",
    orderStatus: "pending",
    customerDetails: {
      name: checkoutSession.customer_details?.name || null,
      email: checkoutSession.customer_details?.email || null,
      phone: checkoutSession.customer_details?.phone || null,
    },
    paidAt: now,
    updatedAt: now,
  };

  await database.collection("orders").updateOne(
    { stripeSessionId: checkoutSession.id },
    { $set: orderUpdate },
  );

  const savedOrder = await database.collection("orders").findOne({
    stripeSessionId: checkoutSession.id,
  });

  const paymentRecord = {
    orderId: savedOrder?._id?.toString?.() || existingOrder?._id?.toString?.() || orderId,
    stripeSessionId: checkoutSession.id,
    transactionId,
    paymentIntentId: transactionId,
    buyerInfo,
    sellerInfo,
    product: {
      productId: productInfo.productId ? String(productInfo.productId) : "",
      title: productInfo.title || "Purchased product",
      price: Number(productInfo.price || 0),
      quantity,
    },
    quantity,
    amountTotal: checkoutSession.amount_total,
    currency: checkoutSession.currency,
    paymentStatus: "paid",
    paymentDate: now,
    paymentMethod: "stripe",
    checkoutStatus: normalizePaymentStatus(checkoutSession.payment_status),
    customerDetails: {
      name: checkoutSession.customer_details?.name || null,
      email: checkoutSession.customer_details?.email || null,
      phone: checkoutSession.customer_details?.phone || null,
    },
    updatedAt: now,
  };

  const savedPayment = await savePaymentRecordOnBackend({
    ...paymentRecord,
    createdAt: paymentRecord.createdAt || now,
  });

  if (ObjectId.isValid(productId)) {
    await markProductSold(
      productId,
      checkoutSession.client_reference_id,
      now,
      quantity,
    );
  }

  return {
    paid: true,
    checkoutSession,
    payment: {
      ...(savedPayment || paymentRecord),
      _id: savedPayment?._id || paymentRecord.stripeSessionId,
    },
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
    orderStatus: normalizeOrderStatus(order.orderStatus),
    quantity: normalizeQuantity(order.quantity, 1),
  }));
}

export async function getSellerOrders(sellerId) {
  const database = await getResellhubDatabase();
  const orders = await database
    .collection("orders")
    .find({ "sellerInfo.userId": sellerId, paymentStatus: "paid" })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return orders.map((order) => ({
    ...order,
    _id: order._id.toString(),
    orderStatus: normalizeOrderStatus(order.orderStatus),
    quantity: normalizeQuantity(order.quantity, 1),
  }));
}

export async function getSellerSalesAnalytics(sellerId) {
  const database = await getResellhubDatabase();
  const orders = await database
    .collection("orders")
    .find({ "sellerInfo.userId": sellerId, paymentStatus: "paid" })
    .toArray();

  const paidOrders = orders.filter((order) => Number.isFinite(Number(order.amountTotal)));
  const now = new Date();
  const months = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    months.push({
      key: monthKey(date),
      label: formatMonthKey(date),
      revenue: 0,
      orders: 0,
      quantity: 0,
    });
  }

  const monthLookup = new Map(months.map((item) => [item.key, item]));
  const productAggregate = new Map();

  for (const order of paidOrders) {
    const createdAt = order.createdAt ? new Date(order.createdAt) : null;
    const safeDate = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : now;
    const bucket = monthLookup.get(monthKey(safeDate));
    const amount = Number(order.amountTotal || 0) / 100;
    const quantity = normalizeQuantity(order.quantity, 1);

    if (bucket) {
      bucket.revenue += amount;
      bucket.orders += 1;
      bucket.quantity += quantity;
    }

    const productTitle = order.product?.title || "Untitled product";
    const productId = order.product?.productId || productTitle;
    const aggregateKey = String(productId);
    const current = productAggregate.get(aggregateKey) || {
      productId: aggregateKey,
      title: productTitle,
      revenue: 0,
      quantity: 0,
      orders: 0,
    };

    current.revenue += amount;
    current.quantity += quantity;
    current.orders += 1;
    productAggregate.set(aggregateKey, current);
  }

  const totalRevenue = months.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = paidOrders.length;
  const totalQuantity = months.reduce((sum, item) => sum + item.quantity, 0);
  const topProducts = Array.from(productAggregate.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const peakRevenue = Math.max(1, ...months.map((item) => item.revenue));

  return {
    summary: {
      totalRevenue,
      totalOrders,
      totalQuantity,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    },
    monthlyTrend: months.map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2)),
      barHeight: Number(((item.revenue / peakRevenue) * 100).toFixed(2)),
    })),
    topProducts: topProducts.map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2)),
    })),
  };
}

export async function getBuyerPayments(buyerId) {
  const remote = await requestBackend(`/payments?buyerId=${encodeURIComponent(buyerId || "")}`);
  return Array.isArray(remote?.data) ? remote.data : [];
}

export async function getBuyerPaymentBySessionId(sessionId, buyerId = "") {
  const remote = await requestBackend(
    `/payments/${encodeURIComponent(sessionId)}?buyerId=${encodeURIComponent(buyerId || "")}`,
  );

  return remote?.data || null;
}

export async function getBuyerOrderById(orderId, buyerId = "") {
  if (typeof orderId !== "string" || !ObjectId.isValid(orderId)) {
    return null;
  }

  const database = await getResellhubDatabase();
  const order = await database.collection("orders").findOne({
    _id: new ObjectId(orderId),
    ...(buyerId ? { "buyerInfo.userId": buyerId } : {}),
  });

  if (!order) {
    return null;
  }

  return {
    ...order,
    _id: order._id.toString(),
    orderStatus: normalizeOrderStatus(order.orderStatus),
    paymentStatus: normalizePaymentStatus(order.paymentStatus),
    quantity: normalizeQuantity(order.quantity, 1),
  };
}

export async function updateOrderStatus({ orderId, sellerId, nextStatus, actorRole = "seller" }) {
  if (typeof orderId !== "string" || !ObjectId.isValid(orderId)) {
    return { error: "Invalid order.", status: 400 };
  }

  const database = await getResellhubDatabase();
  const order = await database.collection("orders").findOne({
    _id: new ObjectId(orderId),
  });

  if (!order) {
    return { error: "Order not found.", status: 404 };
  }

  if (sellerId && order.sellerInfo?.userId && order.sellerInfo.userId !== sellerId) {
    return { error: "Order not found.", status: 404 };
  }

  const currentStatus = normalizeOrderStatus(order.orderStatus);
  const normalizedNextStatus = normalizeOrderStatus(nextStatus);

  if (!ORDER_STATUS_FLOW.includes(normalizedNextStatus)) {
    return { error: "Unsupported order status.", status: 400 };
  }

  if (!canAdvanceOrderStatus(currentStatus, normalizedNextStatus)) {
    return {
      error: `Order status must move from ${currentStatus} to the next step in the flow.`,
      status: 400,
    };
  }

  const result = await database.collection("orders").updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        orderStatus: normalizedNextStatus,
        updatedAt: new Date(),
        statusUpdatedAt: new Date(),
      },
      $push: {
        statusHistory: buildStatusHistoryEntry(normalizedNextStatus, actorRole),
      },
    },
  );

  if (result.matchedCount === 0) {
    return { error: "Order not found.", status: 404 };
  }

  const updatedOrder = await database.collection("orders").findOne({
    _id: new ObjectId(orderId),
  });

  return {
    data: updatedOrder
      ? {
          ...updatedOrder,
          _id: updatedOrder._id.toString(),
          orderStatus: normalizeOrderStatus(updatedOrder.orderStatus),
        }
      : null,
    message: "Order status updated.",
  };
}
