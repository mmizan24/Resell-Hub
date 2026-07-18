import "server-only";

import { getResellhubDatabase } from "@/lib/mongodb";
import { MongoClient } from "mongodb";

const authMongoUri = process.env.MONGODB_URI;
const authDbName = process.env.AUTH_DB_NAME || "resellhub";

if (!authMongoUri) {
  throw new Error("MONGODB_URI is not configured.");
}

const globalForMarketplace = globalThis;

if (!globalForMarketplace.resellhubAuthClientPromise) {
  const client = new MongoClient(authMongoUri);
  globalForMarketplace.resellhubAuthClientPromise = client.connect();
}

async function getAuthDatabase() {
  const client = await globalForMarketplace.resellhubAuthClientPromise;
  return client.db(authDbName);
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRole(role) {
  return normalizeText(role).toLowerCase();
}

function normalizeSearch(value) {
  return normalizeText(value).toLowerCase();
}

function buildAliasList(record = {}) {
  return [
    record?._id?.toString?.() || String(record?._id || ""),
    record?.userId,
    record?.email,
    record?.name,
    record?.phoneNumber || record?.phone,
  ]
    .map(normalizeSearch)
    .filter(Boolean);
}

function avatarSeed(name, email, userId) {
  return encodeURIComponent(normalizeText(name) || normalizeText(email) || normalizeText(userId) || "seller");
}

function safeAverage(total, count) {
  return count > 0 ? Number((total / count).toFixed(1)) : null;
}

async function getMarketplaceData() {
  const database = await getResellhubDatabase();
  const authDb = await getAuthDatabase();

  const [users, products, payments, reviews] = await Promise.all([
    authDb.collection("user").find({}).toArray(),
    database.collection("products").find({}).toArray(),
    database.collection("payments").find({ paymentStatus: "paid" }).toArray(),
    database.collection("reviews").find({}).project({ productId: 1, rating: 1 }).toArray(),
  ]);

  return { users, products, payments, reviews };
}

export async function getMarketplaceOverview() {
  const { users, products, payments } = await getMarketplaceData();

  const totalProducts = products.length;
  const visibleProducts = products.filter((product) => {
    const status = normalizeRole(product.approvalStatus || "approved");
    return status === "approved" || !product.approvalStatus;
  }).length;

  return {
    totalProducts,
    visibleProducts,
    totalSellers: users.filter((user) => normalizeRole(user.role) === "seller").length,
    totalBuyers: users.filter((user) => normalizeRole(user.role) === "buyer").length,
    completedOrders: payments.length,
    totalCategories: Array.from(new Set(products.map((product) => normalizeText(product.category) || "Other"))).length,
  };
}

export async function getTrustedSellers({ limit = 6, search = "" } = {}) {
  const { users, products, payments, reviews } = await getMarketplaceData();
  const sellerUsers = users.filter((user) => normalizeRole(user.role) === "seller");
  const searchQuery = normalizeSearch(search);

  const sellerMap = new Map();
  const sellerLookup = new Map();
  const productIdToSellerId = new Map();

  for (const sellerUser of sellerUsers) {
    const sellerId = sellerUser?._id?.toString?.() || sellerUser?.userId || sellerUser?.email || sellerUser?.name;
    if (!sellerId) {
      continue;
    }

    const seller = {
      _id: sellerId,
      userId: sellerId,
      name: normalizeText(sellerUser.name) || "ResellHub seller",
      email: normalizeText(sellerUser.email) || "",
      location: normalizeText(sellerUser.location) || "Bangladesh",
      phoneNumber: normalizeText(sellerUser.phoneNumber || sellerUser.phone) || "",
      photo: normalizeText(sellerUser.image) || normalizeText(sellerUser.photo) || "",
      productCount: 0,
      availableCount: 0,
      soldCount: 0,
      orderCount: 0,
      revenue: 0,
      totalQuantitySold: 0,
      ratingTotal: 0,
      ratingCount: 0,
      categories: new Set(),
      sampleTitles: [],
      avatarSeed: avatarSeed(sellerUser.name, sellerUser.email, sellerId),
    };

    sellerMap.set(sellerId, seller);
    for (const alias of buildAliasList(sellerUser)) {
      sellerLookup.set(alias, sellerId);
    }
    sellerLookup.set(normalizeSearch(sellerId), sellerId);
  }

  for (const product of products) {
    const source = product?.sellerInfo || {};
    const candidateSellerId = [
      source.userId,
      source.email,
      source.name,
      source.phone,
      source.phoneNumber,
    ]
      .map(normalizeSearch)
      .find((value) => value && sellerLookup.has(value));

    const sellerId = candidateSellerId ? sellerLookup.get(candidateSellerId) : null;
    const seller = sellerId ? sellerMap.get(sellerId) : null;
    if (!seller) {
      continue;
    }

    const productId = product._id?.toString?.() || String(product._id || "");
    productIdToSellerId.set(productId, sellerId);
    seller.productCount += 1;
    if (product.status === "available") {
      seller.availableCount += 1;
    }
    seller.categories.add(normalizeText(product.category) || "Other");
    if (product.title && seller.sampleTitles.length < 3) {
      seller.sampleTitles.push(product.title);
    }
  }

  for (const payment of payments) {
    const sellerKey = [
      payment?.sellerInfo?.userId,
      payment?.sellerInfo?.email,
      payment?.sellerInfo?.name,
      payment?.sellerInfo?.phone,
      payment?.sellerInfo?.phoneNumber,
    ]
      .map(normalizeSearch)
      .find((value) => value && sellerLookup.has(value));

    const sellerId = sellerKey ? sellerLookup.get(sellerKey) : null;
    const seller = sellerId ? sellerMap.get(sellerId) : null;
    if (!seller) {
      continue;
    }

    seller.soldCount += 1;
    seller.orderCount += 1;
    seller.totalQuantitySold += Number.isInteger(payment.quantity) ? payment.quantity : 1;
    seller.revenue += Number(payment.amountTotal || 0);
  }

  for (const review of reviews) {
    const sellerId = review?.productId ? productIdToSellerId.get(String(review.productId)) : null;
    const seller = sellerId ? sellerMap.get(sellerId) : null;
    if (!seller || !Number.isInteger(review.rating)) {
      continue;
    }

    seller.ratingTotal += review.rating;
    seller.ratingCount += 1;
  }

  let sellers = Array.from(sellerMap.values()).map((seller) => ({
    ...seller,
    averageRating: safeAverage(seller.ratingTotal, seller.ratingCount),
    revenue: Number(seller.revenue.toFixed(2)),
    categories: Array.from(seller.categories).slice(0, 4),
  }));

  if (searchQuery) {
    sellers = sellers.filter((seller) => {
      const haystack = [
        seller.name,
        seller.email,
        seller.location,
        ...(seller.categories || []),
        ...(seller.sampleTitles || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchQuery);
    });
  }

  sellers.sort((a, b) => {
    if ((b.averageRating || 0) !== (a.averageRating || 0)) {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }

    if (b.soldCount !== a.soldCount) {
      return b.soldCount - a.soldCount;
    }

    return b.productCount - a.productCount;
  });

  return sellers.slice(0, limit);
}

const CATEGORY_THEME = {
  Electronics: {
    icon: "💻",
    bg: "bg-sky-50",
    border: "border-sky-100",
    description: "Phones, laptops, audio gear, and everyday tech.",
  },
  "Mobile Phones": {
    icon: "📱",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    description: "Smartphones, feature phones, and accessories.",
  },
  Fashion: {
    icon: "👜",
    bg: "bg-rose-50",
    border: "border-rose-100",
    description: "Clothing, shoes, bags, and style essentials.",
  },
  Furniture: {
    icon: "🛋️",
    bg: "bg-amber-50",
    border: "border-amber-100",
    description: "Chairs, tables, storage, and home furniture.",
  },
  Vehicles: {
    icon: "🚗",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    description: "Cars, bikes, parts, and mobility listings.",
  },
  "Home & Living": {
    icon: "🏠",
    bg: "bg-violet-50",
    border: "border-violet-100",
    description: "Kitchen, decor, appliances, and daily home items.",
  },
  Sports: {
    icon: "⚽",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    description: "Fitness gear, outdoor equipment, and sports items.",
  },
  Books: {
    icon: "📚",
    bg: "bg-slate-50",
    border: "border-slate-200",
    description: "Study books, novels, guides, and learning material.",
  },
  Other: {
    icon: "🛍️",
    bg: "bg-stone-50",
    border: "border-stone-200",
    description: "Everything else that still deserves a good listing.",
  },
};

function decorateCategory(category) {
  const theme = CATEGORY_THEME[category.name] || CATEGORY_THEME.Other;
  return {
    ...theme,
    ...category,
    description: category.description || theme.description,
  };
}

export async function getPopularCategories({ limit = 8 } = {}) {
  const { products } = await getMarketplaceData();

  const categoryMap = new Map();

  for (const product of products) {
    const name = normalizeText(product.category) || "Other";
    const current = categoryMap.get(name) || {
      name,
      count: 0,
      sample: [],
    };

    current.count += 1;
    if (product.title && current.sample.length < 3) {
      current.sample.push(product.title);
    }
    categoryMap.set(name, current);
  }

  return Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(decorateCategory);
}

export async function getSellerDirectory({ limit = 24, search = "" } = {}) {
  return getTrustedSellers({ limit, search });
}
