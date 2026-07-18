import { auth } from "@/lib/auth";
import { getSellerOrders } from "@/lib/orders";

async function getSeller(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) return { error: "Please sign in.", status: 401 };
  if ((user.role || "").toLowerCase() !== "seller" && (user.role || "").toLowerCase() !== "admin") {
    return { error: "Seller access only.", status: 403 };
  }

  return { user };
}

export async function GET(request) {
  const seller = await getSeller(request);
  if (seller.error) {
    return Response.json({ success: false, message: seller.error }, { status: seller.status });
  }

  try {
    const orders = await getSellerOrders(seller.user.id);
    return Response.json({ success: true, data: orders });
  } catch (error) {
    console.error("Unable to load seller orders:", error);
    return Response.json({ success: false, message: "Orders could not be loaded." }, { status: 500 });
  }
}
