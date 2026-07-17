import "server-only";

import { getResellhubDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function mapReview(review) {
  return {
    ...review,
    _id: review._id.toString(),
    orderId: review.orderId ? String(review.orderId) : null,
    productId: review.productId ? String(review.productId) : null,
  };
}

export async function getBuyerReviews(buyerId) {
  if (typeof buyerId !== "string" || !buyerId.trim()) return [];

  const database = await getResellhubDatabase();
  const reviews = await database
    .collection("reviews")
    .find({ userId: buyerId })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return reviews.map(mapReview);
}

export async function getProductReviews(productId) {
  if (typeof productId !== "string" || !ObjectId.isValid(productId)) return [];

  const database = await getResellhubDatabase();
  const reviews = await database
    .collection("reviews")
    .find({ productId })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return reviews.map(mapReview);
}

export async function getSellerReviews(sellerId) {
  if (typeof sellerId !== "string" || !sellerId.trim()) return [];

  const database = await getResellhubDatabase();
  const products = await database
    .collection("products")
    .find({ "sellerInfo.userId": sellerId })
    .project({ _id: 1, title: 1, category: 1 })
    .toArray();

  if (products.length === 0) {
    return [];
  }

  const productIdList = products.map((product) => String(product._id));
  const productLookup = new Map(
    products.map((product) => [
      String(product._id),
      {
        _id: String(product._id),
        title: product.title || "Untitled product",
        category: product.category || "Other",
      },
    ]),
  );

  const reviews = await database
    .collection("reviews")
    .find({ productId: { $in: productIdList } })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  return reviews.map((review) => ({
    ...mapReview(review),
    product: productLookup.get(String(review.productId)) || null,
  }));
}

export async function createReviewEntry({
  buyer,
  order,
  rating,
  comments,
}) {
  const database = await getResellhubDatabase();
  const now = new Date();
  const productId = order?.product?.productId ? String(order.product.productId) : "";
  const orderId = order?._id ? String(order._id) : "";

  if (!productId || !ObjectId.isValid(productId)) {
    throw new Error("Invalid product.");
  }

  if (!orderId || !ObjectId.isValid(orderId)) {
    throw new Error("Invalid order.");
  }

  const existingReview = await database.collection("reviews").findOne({
    orderId,
    userId: buyer.id,
  });

  if (existingReview) {
    const error = new Error("You already reviewed this purchase.");
    error.status = 409;
    throw error;
  }

  const reviewDoc = {
    reviewerInfo: {
      userId: buyer.id,
      name: buyer.name || "",
      email: buyer.email || "",
      role: buyer.role || "buyer",
    },
    userId: buyer.id,
    name: order?.product?.title || "Product review",
    productId,
    orderId,
    rating: rating === null || rating === undefined ? null : rating,
    comments: comments.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const result = await database.collection("reviews").insertOne(reviewDoc);

  return {
    ...reviewDoc,
    _id: result.insertedId.toString(),
  };
}

export function normalizeReviewRating(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error("Rating must be between 1 and 5.");
    error.status = 400;
    throw error;
  }

  return rating;
}
