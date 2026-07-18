import { auth } from "@/lib/auth";
import { getResellhubDatabase } from "@/lib/mongodb";
import { validateProductPayload } from "@/lib/product-data";
import { ObjectId } from "mongodb";

async function getAdmin(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) return { error: "Please sign in.", status: 401 };
  if ((user.role || "").toLowerCase() !== "admin") return { error: "Admin access only.", status: 403 };
  return { user };
}

function normalizeApprovalStatus(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["pending", "approved", "rejected"].includes(normalized)) {
    return normalized;
  }
  return "";
}

export async function PATCH(request, { params }) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ success: false, message: "Invalid product." }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const database = await getResellhubDatabase();
    const existingProduct = await database.collection("products").findOne({ _id: new ObjectId(id) });

    if (!existingProduct) {
      return Response.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    const approvalStatus = normalizeApprovalStatus(body?.approvalStatus);
    const moderationOnly = approvalStatus && Object.keys(body || {}).every((key) => ["approvalStatus", "approvalNote"].includes(key));

    if (moderationOnly) {
      const update = {
        approvalStatus,
        approvalReviewedAt: new Date(),
        approvalReviewedBy: admin.user.id,
        updatedAt: new Date(),
      };

      const result = await database.collection("products").updateOne(
        { _id: new ObjectId(id) },
        { $set: update },
      );

      if (result.matchedCount === 0) {
        return Response.json({ success: false, message: "Product not found." }, { status: 404 });
      }

      const updatedProduct = await database.collection("products").findOne({ _id: new ObjectId(id) });

      return Response.json({
        success: true,
        message: approvalStatus === "approved" ? "Product approved." : "Product updated.",
        data: updatedProduct ? { ...updatedProduct, _id: updatedProduct._id.toString() } : null,
      });
    }

    const validation = validateProductPayload(
      {
        ...existingProduct,
        ...body,
        images: Array.isArray(body?.images)
          ? body.images
          : Array.isArray(existingProduct.images)
            ? existingProduct.images
            : [],
      },
      {
        requireImgBB: false,
      },
    );

    if (validation.error) {
      return Response.json({ success: false, message: validation.error }, { status: 422 });
    }

    await database.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...validation.data,
          sellerInfo: existingProduct.sellerInfo,
          approvalStatus: existingProduct.approvalStatus || "pending",
          approvalReviewedAt: existingProduct.approvalReviewedAt || null,
          approvalReviewedBy: existingProduct.approvalReviewedBy || null,
          updatedAt: new Date(),
        },
      },
    );

    const updatedProduct = await database.collection("products").findOne({ _id: new ObjectId(id) });

    return Response.json({
      success: true,
      message: "Product updated.",
      data: updatedProduct ? { ...updatedProduct, _id: updatedProduct._id.toString() } : null,
    });
  } catch (error) {
    console.error("Unable to update product:", error);
    return Response.json({ success: false, message: "Product could not be updated." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await getAdmin(request);
  if (admin.error) {
    return Response.json({ success: false, message: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return Response.json({ success: false, message: "Invalid product." }, { status: 400 });
  }

  try {
    const database = await getResellhubDatabase();
    const result = await database.collection("products").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return Response.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    return Response.json({ success: true, message: "Product deleted." });
  } catch (error) {
    console.error("Unable to delete product:", error);
    return Response.json({ success: false, message: "Product could not be deleted." }, { status: 500 });
  }
}
