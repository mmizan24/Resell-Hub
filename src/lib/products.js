import "server-only";

import { getResellhubDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cache } from "react";

const API_URL = process.env.API_URL || "http://localhost:5000";

export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Products request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Unable to load products:", error);
    return [];
  }
}

export const getProductById = cache(async (id) => {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return null;
  }

  try {
    const database = await getResellhubDatabase();
    const product = await database
      .collection("products")
      .findOne({ _id: new ObjectId(id) });

    if (!product) {
      return null;
    }

    return {
      ...product,
      _id: product._id.toString(),
    };
  } catch (error) {
    console.error("Unable to load product:", error);
    return null;
  }
});
