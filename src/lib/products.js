import "server-only";

import { getResellhubDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cache } from "react";

export async function getProducts() {
  try {
    const database = await getResellhubDatabase();
    const products = await database
      .collection("products")
      .find()
      .sort({ _id: -1 })
      .toArray();

    return products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }));
  } catch (error) {
    console.error("Unable to load products:", error);
    return [];
  }
}

export async function getAvailableProducts() {
  try {
    const database = await getResellhubDatabase();
    const products = await database
      .collection("products")
      .find({ status: "available" })
      .sort({ _id: -1 })
      .limit(100)
      .toArray();

    return products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }));
  } catch (error) {
    console.error("Unable to load available products:", error);
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
