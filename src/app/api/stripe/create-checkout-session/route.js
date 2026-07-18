import { auth } from "@/lib/auth";
import { createPendingOrder } from "@/lib/orders";
import { getProductById } from "@/lib/product-service";
import { getStripe } from "@/lib/stripe";

function getBaseUrl(request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

export async function POST(request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const buyer = session?.user;

  if (!buyer) {
    return Response.json(
      { message: "Please sign in before purchasing." },
      { status: 401 },
    );
  }

  if (buyer.role !== "buyer") {
    return Response.json(
      { message: "Only buyer accounts can purchase products." },
      { status: 403 },
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "The checkout request is invalid." },
      { status: 400 },
    );
  }

  const productId = body?.productId;
  const quantityValue = Number.parseInt(body?.quantity, 10);
  const requestedQuantity = Number.isInteger(quantityValue) ? quantityValue : 1;

  if (typeof productId !== "string" || !productId.trim()) {
    return Response.json(
      { message: "The selected product is invalid." },
      { status: 400 },
    );
  }

  const product = await getProductById(productId);

  if (!product) {
    return Response.json(
      { message: "The selected product no longer exists." },
      { status: 404 },
    );
  }

  if (product.status !== "available") {
    return Response.json(
      { message: "This product is no longer available." },
      { status: 409 },
    );
  }

  const price = Number(product.price);
  const stockCount = Number.isInteger(product.quantity) && product.quantity >= 0 ? product.quantity : 0;

  if (!Number.isFinite(price) || price <= 0) {
    return Response.json(
      { message: "This product does not have a valid price." },
      { status: 422 },
    );
  }

  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    return Response.json(
      { message: "Please choose a valid quantity." },
      { status: 400 },
    );
  }

  if (stockCount < requestedQuantity) {
    return Response.json(
      { message: `Only ${stockCount} item${stockCount === 1 ? "" : "s"} are left in stock.` },
      { status: 409 },
    );
  }

  const unitAmount = Math.round(price * 100);
  const productImage = product.images?.find((image) => {
    if (typeof image !== "string") return false;

    try {
      return new URL(image).protocol === "https:";
    } catch {
      return false;
    }
  });

  let checkoutSession;

  try {
    const stripe = getStripe();
    const baseUrl = getBaseUrl(request);

    checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: buyer.id,
      customer_email: buyer.email,
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          quantity: requestedQuantity,
          price_data: {
            currency: "bdt",
            unit_amount: unitAmount,
            product_data: {
              name: product.title.slice(0, 120),
              description: product.description?.slice(0, 500) || undefined,
              images: productImage ? [productImage] : undefined,
              metadata: {
                productId,
                sellerId: product.sellerInfo?.userId || "",
              },
            },
          },
        },
      ],
      metadata: {
        productId,
        buyerId: buyer.id,
        sellerId: product.sellerInfo?.userId || "",
        quantity: String(requestedQuantity),
      },
      payment_intent_data: {
        metadata: {
          productId,
          buyerId: buyer.id,
          sellerId: product.sellerInfo?.userId || "",
          quantity: String(requestedQuantity),
        },
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?product_id=${productId}`,
    });

    await createPendingOrder({
      checkoutSession,
      product,
      buyer,
      quantity: requestedQuantity,
    });
  } catch (error) {
    console.error("Unable to create Stripe Checkout session:", error);

    if (checkoutSession?.id) {
      try {
        await getStripe().checkout.sessions.expire(checkoutSession.id);
      } catch (expirationError) {
        console.error(
          "Unable to expire incomplete Checkout session:",
          expirationError,
        );
      }
    }

    return Response.json(
      { message: "Checkout could not be started. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({
    url: checkoutSession.url,
  });
}
