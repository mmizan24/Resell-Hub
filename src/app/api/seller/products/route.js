import { auth } from "@/lib/auth";
import { getSellerProducts, createSellerProduct } from "@/lib/product-service";

async function getSeller(request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const user = session?.user;

  if (!user) {
    return { error: "Please sign in.", status: 401 };
  }

  if (user.role !== "seller") {
    return { error: "Seller access only.", status: 403 };
  }

  return { user };
}

export async function GET(request) {
  const seller = await getSeller(request);

  if (seller.error) {
    return Response.json(
      { success: false, message: seller.error },
      { status: seller.status },
    );
  }

  try {
    const products = await getSellerProducts(seller.user.id);

    return Response.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Unable to load seller products:", error);
    return Response.json(
      { success: false, message: "Products could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const seller = await getSeller(request);

  if (seller.error) {
    return Response.json(
      { success: false, message: seller.error },
      { status: seller.status },
    );
  }

  if (
    !seller.user.id ||
    !seller.user.name ||
    !seller.user.email ||
    !seller.user.phoneNumber
  ) {
    return Response.json(
      {
        success: false,
        message:
          "Your seller profile must include a name, email, and phone number.",
      },
      { status: 422 },
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
    const result = await createSellerProduct({
      title: payload.title,
      category: payload.category,
      condition: payload.condition,
      price: Number(payload.price),
      quantity: Number(payload.quantity),
      images: payload.images,
      description: payload.description,
      sellerInfo: {
        userId: seller.user.id,
        name: seller.user.name,
        email: seller.user.email,
        phone: seller.user.phoneNumber,
      },
      status: payload.status,
    });

    if (result.error) {
      return Response.json(
        { success: false, message: result.error },
        { status: result.status || 422 },
      );
    }

    return Response.json(
      {
        success: true,
        message: result.message || "Product added successfully.",
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create product:", error);
    return Response.json(
      { success: false, message: "The product could not be saved." },
      { status: 500 },
    );
  }
}
