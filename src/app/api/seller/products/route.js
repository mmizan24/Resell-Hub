import { auth } from "@/lib/auth";
import { getResellhubDatabase } from "@/lib/mongodb";
import { productDTO, validateProductPayload } from "@/lib/product-data";
import { revalidatePath } from "next/cache";

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
    const database = await getResellhubDatabase();
    const products = await database
      .collection("products")
      .find({ "sellerInfo.userId": seller.user.id })
      .sort({ _id: -1 })
      .toArray();

    return Response.json({
      success: true,
      data: products.map(productDTO),
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

  const validation = validateProductPayload(payload);

  if (validation.error) {
    return Response.json(
      { success: false, message: validation.error },
      { status: 422 },
    );
  }

  const product = {
    title: validation.data.title,
    category: validation.data.category,
    condition: validation.data.condition,
    price: validation.data.price,
    images: validation.data.images,
    description: validation.data.description,
    sellerInfo: {
      userId: seller.user.id,
      name: seller.user.name,
      email: seller.user.email,
      phone: seller.user.phoneNumber,
    },
    status: validation.data.status,
  };

  try {
    const database = await getResellhubDatabase();
    const result = await database.collection("products").insertOne(product);
    const createdProduct = {
      ...product,
      _id: result.insertedId,
    };

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/dashboard/buyer");

    return Response.json(
      {
        success: true,
        message: "Product added successfully.",
        data: productDTO(createdProduct),
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
