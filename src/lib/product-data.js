import "server-only";

export const PRODUCT_CONDITIONS = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];
export const PRODUCT_STATUSES = ["available", "out of stock"];

function textValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidImageUrl(value, requireImgBB) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return false;
    }

    return !requireImgBB || url.hostname === "i.ibb.co";
  } catch {
    return false;
  }
}

export function validateProductPayload(payload, { requireImgBB = true } = {}) {
  const title = textValue(payload?.title);
  const category = textValue(payload?.category);
  const condition = textValue(payload?.condition);
  const description = textValue(payload?.description);
  const status = textValue(payload?.status);
  const price = Number(payload?.price);
  const quantity = Number(payload?.quantity);
  const images = [
    ...new Set(
      (Array.isArray(payload?.images) ? payload.images : [])
        .filter((image) => typeof image === "string")
        .map((image) => image.trim())
        .filter(Boolean),
    ),
  ];

  if (title.length < 3 || title.length > 120) {
    return { error: "Title must be between 3 and 120 characters." };
  }

  if (!category || category.length > 60) {
    return { error: "Please select a valid category." };
  }

  if (!PRODUCT_CONDITIONS.includes(condition)) {
    return { error: "Please select a valid condition." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Price must be greater than zero." };
  }

  const quantityFloor = status === "out of stock" ? 0 : 1;

  if (!Number.isInteger(quantity) || quantity < quantityFloor || quantity > 999) {
    return {
      error:
        quantityFloor === 0
          ? "Quantity must be an integer between 0 and 999."
          : "Quantity must be an integer between 1 and 999.",
    };
  }

  if (images.length === 0 || images.length > 8) {
    return { error: "Add between 1 and 8 product images." };
  }

  if (images.some((image) => !isValidImageUrl(image, requireImgBB))) {
    return {
      error: requireImgBB
        ? "All new images must be uploaded through ImgBB."
        : "One or more image URLs are invalid.",
    };
  }

  if (description.length < 10 || description.length > 2000) {
    return {
      error: "Description must be between 10 and 2,000 characters.",
    };
  }

  if (!PRODUCT_STATUSES.includes(status)) {
    return { error: "Please select a valid product status." };
  }

  return {
    data: {
      title,
      category,
      condition,
      price,
      quantity,
      images,
      description,
      status,
    },
  };
}

export function productDTO(product) {
  return {
    _id: product._id.toString(),
    title: product.title,
    category: product.category,
    condition: product.condition,
    price: product.price,
    quantity: Number.isInteger(product.quantity) && product.quantity >= 0 ? product.quantity : (product.status === "out of stock" ? 0 : 1),
    images: Array.isArray(product.images) ? product.images : [],
    description: product.description,
    sellerInfo: product.sellerInfo,
    status: product.status,
  };
}
