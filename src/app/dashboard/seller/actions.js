"use server";

import { auth } from "@/lib/auth";
import { getResellhubDatabase } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const ALLOWED_CONDITIONS = new Set([
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
]);
const ALLOWED_STATUSES = new Set(["available", "out of stock"]);

function textValue(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "i.ibb.co";
  } catch {
    return false;
  }
}

export async function createProduct(_previousState, formData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user) {
    return { success: false, message: "Please sign in before adding a product." };
  }

  if (user.role !== "seller") {
    return {
      success: false,
      message: "Only seller accounts can add products.",
    };
  }

  const title = textValue(formData, "title");
  const category = textValue(formData, "category");
  const condition = textValue(formData, "condition");
  const description = textValue(formData, "description");
  const status = textValue(formData, "status");
  const priceText = textValue(formData, "price");
  const price = Number(priceText);
  const images = [
    ...new Set(
      formData
        .getAll("images")
        .filter((image) => typeof image === "string")
        .map((image) => image.trim())
        .filter(Boolean),
    ),
  ];

  if (title.length < 3 || title.length > 120) {
    return {
      success: false,
      message: "Title must be between 3 and 120 characters.",
    };
  }

  if (!category || category.length > 60) {
    return { success: false, message: "Please select a valid category." };
  }

  if (!ALLOWED_CONDITIONS.has(condition)) {
    return { success: false, message: "Please select a valid condition." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { success: false, message: "Price must be greater than zero." };
  }

  if (images.length === 0 || images.length > 8) {
    return {
      success: false,
      message: "Add between 1 and 8 product images.",
    };
  }

  if (images.some((image) => !isValidImageUrl(image))) {
    return {
      success: false,
      message: "One or more images were not uploaded through ImgBB.",
    };
  }

  if (description.length < 10 || description.length > 2000) {
    return {
      success: false,
      message: "Description must be between 10 and 2,000 characters.",
    };
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return { success: false, message: "Please select a valid product status." };
  }

  if (!user.id || !user.name || !user.email || !user.phoneNumber) {
    return {
      success: false,
      message:
        "Your seller profile must include a name, email address, and phone number.",
    };
  }

  const product = {
    title,
    category,
    condition,
    price,
    images,
    description,
    sellerInfo: {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phoneNumber,
    },
    status,
  };

  try {
    const database = await getResellhubDatabase();
    await database.collection("products").insertOne(product);
  } catch (error) {
    console.error("Unable to create product:", error);
    return {
      success: false,
      message: "The product could not be saved. Please try again.",
    };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard/seller");

  return {
    success: true,
    message: "Product added successfully.",
  };
}
