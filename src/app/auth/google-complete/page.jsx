import { GoogleCompleteClient } from "@/components/auth/GoogleCompleteClient";

export const dynamic = "force-dynamic";

export default async function GoogleCompletePage({ searchParams }) {
  const params = await searchParams;
  const requestedRole =
    typeof params?.role === "string" ? params.role : "";

  return <GoogleCompleteClient requestedRole={requestedRole} />;
}
