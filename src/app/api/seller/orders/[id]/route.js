import { auth } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/orders";

async function getSeller(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) return { error: "Please sign in.", status: 401 };
  if ((user.role || "").toLowerCase() !== "seller" && (user.role || "").toLowerCase() !== "admin") {
    return { error: "Seller access only.", status: 403 };
  }

  return { user };
}

export async function PATCH(request, { params }) {
  const seller = await getSeller(request);
  if (seller.error) {
    return Response.json({ success: false, message: seller.error }, { status: seller.status });
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const nextStatus = typeof body?.orderStatus === "string" ? body.orderStatus : body?.status;
    const result = await updateOrderStatus({
      orderId: id,
      sellerId: seller.user.role?.toLowerCase() === "admin" ? null : seller.user.id,
      nextStatus,
      actorRole: seller.user.role || "seller",
    });

    if (result.error) {
      return Response.json({ success: false, message: result.error }, { status: result.status || 400 });
    }

    return Response.json({ success: true, message: result.message || "Order updated.", data: result.data });
  } catch (error) {
    console.error("Unable to update seller order:", error);
    return Response.json({ success: false, message: "Order could not be updated." }, { status: 500 });
  }
}
