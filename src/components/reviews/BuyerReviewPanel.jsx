"use client";

import { useMemo, useState } from "react";

function StarIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} aria-hidden="true">
      <path
        d="m12 17.27 5.18 3.13-1.39-5.89L20.5 10.2l-6.03-.51L12 4.25 9.53 9.69 3.5 10.2l4.71 4.31-1.39 5.89L12 17.27Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RatingStars({ value }) {
  const rating = Number(value);
  const filledCount = Number.isInteger(rating) ? rating : 0;

  return (
    <div className="flex items-center gap-0.5" aria-label={filledCount ? `${filledCount} star rating` : "No rating"}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= filledCount} />
      ))}
    </div>
  );
}

function formatMoney(amount, currency) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "Price unavailable";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: (currency || "bdt").toUpperCase(),
  }).format(numeric / 100);
}

function defaultForm() {
  return { rating: "", comments: "" };
}

export function BuyerReviewPanel({ paidOrders = [], reviews = [] }) {
  const [forms, setForms] = useState({});
  const [submittedReviews, setSubmittedReviews] = useState(reviews);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [savingOrderId, setSavingOrderId] = useState("");

  const reviewByOrderId = useMemo(() => {
    const lookup = new Map();
    submittedReviews.forEach((review) => {
      if (review.orderId) {
        lookup.set(review.orderId, review);
      }
    });
    return lookup;
  }, [submittedReviews]);

  const pendingOrders = paidOrders.filter((order) => !reviewByOrderId.has(order._id));
  const reviewedOrders = paidOrders.filter((order) => reviewByOrderId.has(order._id));

  function updateForm(orderId, key, value) {
    setForms((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] || defaultForm()),
        [key]: value,
      },
    }));
  }

  async function submitReview(order) {
    const form = forms[order._id] || defaultForm();
    const comments = form.comments.trim();
    const rating = form.rating ? Number(form.rating) : null;

    if (comments.length < 5) {
      setMessage("Please write a helpful comment for your review.");
      setMessageType("error");
      return;
    }

    setSavingOrderId(order._id);
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId: order._id,
          productId: order.product?.productId,
          rating,
          comments,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Review could not be saved.");
      }

      const nextReview = result.data;
      setSubmittedReviews((current) => [nextReview, ...current]);
      setForms((current) => {
        const next = { ...current };
        delete next[order._id];
        return next;
      });
      setMessage("Your review has been submitted.");
      setMessageType("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review could not be saved.");
      setMessageType("error");
    } finally {
      setSavingOrderId("");
    }
  }

  return (
    <section id="reviews" className="mt-12 scroll-mt-24">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Reviews</p>
          <h2 className="mt-1 text-2xl font-bold text-blue-950">Review your purchases</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add a review after buying a product. Rating is optional, so you can leave a comment-only review too.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {submittedReviews.length} submitted
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {pendingOrders.length} pending reviews
          </span>
        </div>
      </div>

      {message ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            messageType === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      {paidOrders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="font-semibold text-slate-800">No completed purchases yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Buy a product first, then you will be able to leave a review here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {pendingOrders.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingOrders.map((order) => {
                const form = forms[order._id] || defaultForm();

                return (
                  <article key={order._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Purchased item</p>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          {order.product?.title || "Product order"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          from {order.sellerInfo?.name || "Seller"}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {formatMoney(order.amountTotal, order.currency)}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)]">
                        <label className="space-y-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Rating
                          </span>
                          <select
                            value={form.rating}
                            onChange={(event) => updateForm(order._id, "rating", event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">No rating</option>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                          </select>
                        </label>

                        <label className="space-y-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Comments
                          </span>
                          <textarea
                            value={form.comments}
                            onChange={(event) => updateForm(order._id, "comments", event.target.value)}
                            placeholder="Share what you liked, what could be better, and whether you would recommend the seller."
                            rows={4}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Optional rating is supported. If you skip it, your comment still saves.
                      </p>
                      <button
                        type="button"
                        onClick={() => submitReview(order)}
                        disabled={savingOrderId === order._id}
                        className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {savingOrderId === order._id ? "Submitting..." : "Submit review"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-blue-950">Submitted reviews</h3>
              <p className="mt-1 text-sm text-slate-600">
                Your latest feedback for purchased products.
              </p>
            </div>

            {submittedReviews.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500">
                No reviews have been submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {submittedReviews.map((review) => (
                  <article key={review._id} className="px-5 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.name || "Product review"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Review by {review.reviewerInfo?.name || "Buyer"} • {review.productId}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {review.rating === null || review.rating === undefined ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            No rating
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RatingStars value={review.rating} />
                            <span className="text-xs font-semibold text-slate-600">{review.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.comments}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {reviewedOrders.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          You have already reviewed {reviewedOrders.length} purchased product
          {reviewedOrders.length > 1 ? "s" : ""}.
        </div>
      ) : null}
    </section>
  );
}
