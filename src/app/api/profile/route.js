import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return Response.json({ message: "You must be signed in to update your profile." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = {
      name: body?.name,
      phoneNumber: body?.phoneNumber,
      location: body?.location,
    };

    if (typeof body?.image === "string" && body.image.trim()) {
      payload.image = body.image;
    }

    const result = await auth.api.updateUser({
      headers: await headers(),
      body: payload,
    });

    return Response.json({ success: true, user: result?.user || null });
  } catch (error) {
    return Response.json(
      { message: error?.message || "Unable to update your profile right now." },
      { status: 500 },
    );
  }
}
