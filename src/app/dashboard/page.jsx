"use client";

import { useSession } from "@/lib/auth-client";
import { getDashboardPathForRole } from "@/lib/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const role = session?.user?.role;

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!role) {
      router.replace("/auth/sign-in");
      return;
    }

    router.replace(getDashboardPathForRole(role));
  }, [isPending, role, router]);

  return (
    <section className="flex min-h-[360px] items-center justify-center bg-slate-50 px-5 py-12">
      <p className="text-sm font-medium text-slate-500">Opening your dashboard...</p>
    </section>
  );
}
