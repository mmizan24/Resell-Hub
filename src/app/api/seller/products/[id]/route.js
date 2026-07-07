import { auth } from "@/lib/auth";
import { getResellhubDatabase } from "@/lib/mongodb";
import { productDTO, validateProductPayload } from "@/lib/product-data";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

function arraysEqual(left, right) {
  return (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export async function PATCH(request, { params }) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const seller = session?.user;

  if (!seller) {
    return Response.json(
      { success: false, message: "Please sign in." },
      { status: 401 },
    );
  }

  if (seller.role !== "seller") {
    return Response.json(
      { success: false, message: "Seller access only." },
      { status: 403 },
    );
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return Response.json(
      { success: false, message: "Invalid product." },
      { status: 400 },
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "The product data is invalid." },
      { status: 400 },
    );
  }

  try {
    const database = await getResellhubDatabase();
    const filter = {
      _id: new ObjectId(id),
      "sellerInfo.userId": seller.id,
    };
    const existingProduct = await database
      .collection("products")
      .findOne(filter);

    if (!existingProduct) {
      return Response.json(
        {
          success: false,
          message: "Product not found or you do not own this product.",
        },
        { status: 404 },
      );
    }

    const keepsExistingImages = arraysEqual(
      payload?.images,
      existingProduct.images,
    );
    const validation = validateProductPayload(payload, {
      requireImgBB: !keepsExistingImages,
    });

    if (validation.error) {
      return Response.json(
        { success: false, message: validation.error },
        { status: 422 },
      );
    }

    await database.collection("products").updateOne(filter, {
      $set: validation.data,
    });

    const updatedProduct = await database
      .collection("products")
      .findOne(filter);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/dashboard/buyer");

    return Response.json({
      success: true,
      message: "Product updated successfully.",
      data: productDTO(updatedProduct),
    });
  } catch (error) {
    console.error("Unable to update product:", error);
    return Response.json(
      { success: false, message: "The product could not be updated." },
      { status: 500 },
    );
  }
}
