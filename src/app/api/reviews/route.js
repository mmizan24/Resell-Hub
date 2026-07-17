import { auth } from "@/lib/auth";
import { getResellhubDatabase } from "@/lib/mongodb";
import {
  createReviewEntry,
  getBuyerReviews,
  getProductReviews,
  getSellerReviews,
  normalizeReviewRating,
} from "@/lib/reviews";
import { ObjectId } from "mongodb";

async function getSessionUser(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user || null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const sellerId = searchParams.get("sellerId");

    if (productId) {
      const reviews = await getProductReviews(productId);
      return Response.json({ success: true, data: reviews });
    }

    if (sellerId) {
      const user = await getSessionUser(request);
      if (!user) {
        return Response.json({ success: false, message: "Please sign in." }, { status: 401 });
      }

      const userRole = (user.role || "").toLowerCase();
      if (userRole !== "admin" && userRole !== "seller") {
        return Response.json({ success: false, message: "Seller access only." }, { status: 403 });
      }

      if (userRole === "seller" && user.id !== sellerId) {
        return Response.json({ success: false, message: "You can only view your own reviews." }, { status: 403 });
      }

      const reviews = await getSellerReviews(sellerId);
      return Response.json({ success: true, data: reviews });
    }

    const user = await getSessionUser(request);
    if (!user) {
      return Response.json({ success: false, message: "Please sign in." }, { status: 401 });
    }

    const reviews = await getBuyerReviews(user.id);
    return Response.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Unable to load reviews:", error);
    return Response.json({ success: false, message: "Reviews could not be loaded." }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getSessionUser(request);
  if (!user) {
    return Response.json({ success: false, message: "Please sign in." }, { status: 401 });
  }

  if ((user.role || "").toLowerCase() !== "buyer") {
    return Response.json({ success: false, message: "Buyer access only." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
    const comments = typeof body?.comments === "string" ? body.comments.trim() : "";
    const rating = normalizeReviewRating(body?.rating);

    if (!orderId || !ObjectId.isValid(orderId)) {
      return Response.json({ success: false, message: "A valid order is required." }, { status: 400 });
    }

    if (!productId || !ObjectId.isValid(productId)) {
      return Response.json({ success: false, message: "A valid product is required." }, { status: 400 });
    }

    if (comments.length < 5) {
      return Response.json(
        { success: false, message: "Please write a short helpful comment." },
        { status: 400 },
      );
    }

    const database = await getResellhubDatabase();
    const order = await database.collection("orders").findOne({
      _id: new ObjectId(orderId),
      "buyerInfo.userId": user.id,
    });

    if (!order) {
      return Response.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if ((order.paymentStatus || "").toLowerCase() !== "paid") {
      return Response.json(
        { success: false, message: "You can review only after payment is completed." },
        { status: 400 },
      );
    }

    if (String(order.product?.productId || "") !== productId) {
      return Response.json(
        { success: false, message: "This review does not match the purchased product." },
        { status: 400 },
      );
    }

    const review = await createReviewEntry({
      buyer: user,
      order: {
        ...order,
        _id: order._id.toString(),
      },
      rating,
      comments,
    });

    return Response.json({
      success: true,
      message: "Review submitted successfully.",
      data: review,
    });
  } catch (error) {
    if (error?.status) {
      return Response.json({ success: false, message: error.message }, { status: error.status });
    }

    console.error("Unable to create review:", error);
    return Response.json({ success: false, message: "Review could not be saved." }, { status: 500 });
  }
}
