export function normalizeRole(role) {
  return typeof role === "string" ? role.toLowerCase() : "";
}

export const MARKETPLACE_ROLES = ["seller", "buyer"];

export function isMarketplaceRole(role) {
  return MARKETPLACE_ROLES.includes(normalizeRole(role));
}

export function isAdminRole(role) {
  return normalizeRole(role) === "admin";
}

export function canAccessSellerArea(role) {
  const normalized = normalizeRole(role);
  return normalized === "seller" || normalized === "admin";
}

export function canAccessBuyerArea(role) {
  const normalized = normalizeRole(role);
  return normalized === "buyer" || normalized === "admin";
}

export function getDashboardPathForRole(role) {
  const normalized = normalizeRole(role);

  if (normalized === "seller") return "/dashboard/seller";
  if (normalized === "buyer") return "/dashboard/buyer";
  if (normalized === "admin") return "/dashboard/admin";

  return "/auth/sign-in";
}
