"use client";

import { authClient } from "@/lib/auth-client";
import { getDashboardPathForRole, isMarketplaceRole, normalizeRole } from "@/lib/roles";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function GoogleCompleteClient({ requestedRole = "" }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(true);

  const role = useMemo(() => {
    const normalizedRole = normalizeRole(requestedRole);
    return isMarketplaceRole(normalizedRole) ? normalizedRole : "seller";
  }, [requestedRole]);

  useEffect(() => {
    let cancelled = false;

    async function syncRoleAndRedirect() {
      if (isPending) {
        return;
      }

      if (!session?.user) {
        router.replace("/auth/sign-in");
        return;
      }

      try {
        setIsSavingRole(true);

        if (session.user.role !== role) {
          const response = await fetch("/api/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role }),
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.message || "Unable to save your Google sign-in role.");
          }
        }

        if (!cancelled) {
          router.replace(getDashboardPathForRole(role));
          router.refresh();
        }
      } catch (syncError) {
        if (!cancelled) {
          setError(syncError?.message || "Unable to finish Google sign-in.");
        }
      } finally {
        if (!cancelled) {
          setIsSavingRole(false);
        }
      }
    }

    syncRoleAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [isPending, role, router, session]);

  return (
    <section className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Google sign-in
        </p>
        <h1 className="mt-2 text-2xl font-bold text-blue-950">
          Finalizing your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We are confirming your role as{" "}
          <span className="font-semibold text-slate-800">{role}</span> and sending
          you to the right dashboard.
        </p>

        {!error ? (
          <div className="mt-6 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {isSavingRole ? "Saving your role and completing sign-in..." : "Redirecting..."}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.replace("/auth/sign-in")}
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800"
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
