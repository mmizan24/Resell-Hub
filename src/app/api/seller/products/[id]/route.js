import { auth } from "@/lib/auth";
import { updateSellerProduct } from "@/lib/product-service";
import { ObjectId } from "mongodb";

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
    const result = await updateSellerProduct({
      id,
      sellerId: seller.id,
      payload,
    });

    if (result.error) {
      return Response.json(
        { success: false, message: result.error },
        { status: result.status || 422 },
      );
    }

    return Response.json({
      success: true,
      message: "Product updated successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("Unable to update product:", error);
    return Response.json(
      { success: false, message: "The product could not be updated." },
      { status: 500 },
    );
  }
}
