"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const EMPTY_FORM = {
  userIdOrEmail: "",
  makePrime: false,
};

function normalizeRole(role) {
  return typeof role === "string" && role.trim() ? role.trim().toLowerCase() : "buyer";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function memberStatus(member) {
  if (member?.status === "revoked") return "revoked";
  if (member?.isPrime) return "prime";
  return "active";
}

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border bg-white p-4 shadow-xl ring-1 transition ${
            toast.type === "success"
              ? "border-emerald-200 ring-emerald-100"
              : toast.type === "error"
                ? "border-rose-200 ring-rose-100"
                : "border-sky-200 ring-sky-100"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                toast.type === "success"
                  ? "bg-emerald-500"
                  : toast.type === "error"
                    ? "bg-rose-500"
                    : "bg-sky-500"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-slate-600">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-full px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminMembersPanel() {
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const activeMembers = useMemo(
    () => members.filter((member) => member.status !== "revoked"),
    [members],
  );
  const primeMember = useMemo(
    () => activeMembers.find((member) => member.isPrime) || null,
    [activeMembers],
  );
  const revokedMembers = useMemo(
    () => members.filter((member) => member.status === "revoked"),
    [members],
  );
  const eligibleUsers = useMemo(
    () => users.filter((user) => normalizeRole(user.role) !== "admin"),
    [users],
  );
  const selectedUser = useMemo(
    () =>
      eligibleUsers.find((user) => user.id === form.userIdOrEmail || user.email === form.userIdOrEmail) || null,
    [eligibleUsers, form.userIdOrEmail],
  );

  function pushToast(type, title, description = "") {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current, { id, type, title, description }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  async function fetchAdminData() {
    const [membersResponse, usersResponse] = await Promise.all([
      fetch("/api/admin/admins", { credentials: "include" }),
      fetch("/api/admin/users", { credentials: "include" }),
    ]);

    const [membersResult, usersResult] = await Promise.all([
      membersResponse.json().catch(() => null),
      usersResponse.json().catch(() => null),
    ]);

    if (!membersResponse.ok || !membersResult?.success) {
      throw new Error(membersResult?.message || "Unable to load admin members.");
    }

    if (!usersResponse.ok || !usersResult?.success) {
      throw new Error(usersResult?.message || "Unable to load users.");
    }

    return {
      members: Array.isArray(membersResult.data) ? membersResult.data : [],
      users: Array.isArray(usersResult.data) ? usersResult.data : [],
    };
  }

  async function reloadAdminData() {
    const data = await fetchAdminData();
    setMembers(data.members);
    setUsers(data.users);
  }

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const data = await fetchAdminData();
        if (!active) return;
        setMembers(data.members);
        setUsers(data.users);
      } catch (error) {
        if (!active) return;
        const messageText = error?.message || "Unable to load admin members.";
        setMessageType("error");
        setMessage(messageText);
        pushToast("error", "Load failed", messageText);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleUserSelection(userId) {
    if (!userId) {
      setForm((current) => ({ ...current, userIdOrEmail: "" }));
      return;
    }

    const user = eligibleUsers.find((item) => item.id === userId) || null;
    setForm((current) => ({
      ...current,
      userIdOrEmail: user?.email || user?.id || userId,
    }));
  }

  async function grantAdminship(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const target = form.userIdOrEmail.trim();
    if (!target) {
      const messageText = "Pick a user from the dropdown or type a valid email address.";
      setMessageType("error");
      setMessage(messageText);
      pushToast("error", "Missing user", messageText);
      setIsSaving(false);
      return;
    }

    const matchingUser =
      eligibleUsers.find((user) => user.id === target || user.email === target) || selectedUser;

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: matchingUser?.id || target,
          email: matchingUser?.email || target,
          makePrime: form.makePrime,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to grant adminship.");
      }

      const successText = result?.message || "Adminship granted.";
      setMessageType("success");
      setMessage(successText);
      pushToast(
        "success",
        form.makePrime ? "Prime admin granted" : "Adminship granted",
        matchingUser?.email
          ? `${matchingUser.email} is now an admin.`
          : "The selected account was updated successfully.",
      );
      setForm(EMPTY_FORM);
      await reloadAdminData();
    } catch (error) {
      const messageText = error?.message || "Unable to grant adminship.";
      setMessageType("error");
      setMessage(messageText);
      pushToast("error", "Grant failed", messageText);
    } finally {
      setIsSaving(false);
    }
  }

  async function makePrime(memberId) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/admins/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ makePrime: true }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to promote prime admin.");
      }

      const successText = result?.message || "Prime admin updated.";
      setMessageType("success");
      setMessage(successText);
      pushToast("success", "Prime admin updated", "Prime status moved successfully.");
      await reloadAdminData();
    } catch (error) {
      const messageText = error?.message || "Unable to promote prime admin.";
      setMessageType("error");
      setMessage(messageText);
      pushToast("error", "Promotion failed", messageText);
    } finally {
      setIsSaving(false);
    }
  }

  async function revokeAdminship(memberId) {
    const confirmed = window.confirm(
      "Revoke this adminship? The user will lose admin access and their previous role will be restored.",
    );
    if (!confirmed) return;

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/admins/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to revoke adminship.");
      }

      const successText = result?.message || "Adminship revoked.";
      setMessageType("success");
      setMessage(successText);
      pushToast("success", "Adminship revoked", "The account was restored to its previous role.");
      await reloadAdminData();
    } catch (error) {
      const messageText = error?.message || "Unable to revoke adminship.";
      setMessageType("error");
      setMessage(messageText);
      pushToast("error", "Revoke failed", messageText);
    } finally {
      setIsSaving(false);
    }
  }

  const activeCount = activeMembers.length;
  const revokedCount = revokedMembers.length;

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <section id="admins" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Admin team</p>
            <h2 className="mt-2 text-2xl font-bold text-blue-950">Manage admin membership</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add new admins from the MongoDB-backed users list, make one account the prime admin, and revoke
              access whenever needed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              Active: {activeCount}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
              Revoked: {revokedCount}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              Prime: {primeMember?.name || primeMember?.email || "Not set"}
            </span>
          </div>
        </div>

        {message ? (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              messageType === "success"
                ? "bg-emerald-50 text-emerald-700"
                : messageType === "error"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {message}
          </p>
        ) : null}

        <div className="mt-6 space-y-6">
          <form onSubmit={grantAdminship} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-blue-950">Grant adminship</h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose an existing user or type the email address / auth user ID. The selected account will be
              moved into the admins collection and its auth role will become admin.
            </p>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Choose from users
              <select
                value={selectedUser?.id || ""}
                onChange={(event) => handleUserSelection(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isSaving || loading}
              >
                <option value="">Select a user</option>
                {eligibleUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {(user.name || "Unnamed user") +
                      " - " +
                      (user.email || user.id) +
                      " (" +
                      normalizeRole(user.role) +
                      ")"}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              User email or ID
              <input
                type="text"
                value={form.userIdOrEmail}
                onChange={(event) => updateField("userIdOrEmail", event.target.value)}
                placeholder="seller@site.com or 66f..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isSaving}
              />
            </label>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.makePrime}
                onChange={(event) => updateField("makePrime", event.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-slate-300 text-blue-700"
              />
              Make this user the prime admin
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:transform-none"
              >
                {isSaving ? "Saving..." : "Grant adminship"}
              </button>
              <button
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
                disabled={isSaving}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <h3 className="text-lg font-semibold text-blue-950">Current members</h3>
              <p className="mt-1 text-sm text-slate-600">
                Promote one admin to prime, or revoke access after moving them back to a normal role.
              </p>
            </div>

            {loading ? (
              <div className="bg-slate-50 px-5 py-6 text-sm text-slate-500">Loading admin members...</div>
            ) : members.length === 0 ? (
              <div className="bg-slate-50 px-5 py-6 text-sm text-slate-500">
                No admin records yet. The first admin is created automatically for the currently signed-in prime
                account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Admin</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Joined</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {members.map((member) => {
                      const status = memberStatus(member);
                      return (
                        <tr key={member.id} className="align-top">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{member.name || "Unnamed admin"}</div>
                            <div className="text-xs text-slate-500">{member.email || member.userId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                              {member.role || "buyer"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                                status === "prime"
                                  ? "bg-amber-100 text-amber-700"
                                  : status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatDate(member.promotedAt || member.createdAt || member.updatedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {member.status !== "revoked" && !member.isPrime ? (
                                <button
                                  type="button"
                                  onClick={() => makePrime(member.id)}
                                  disabled={isSaving}
                                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Make prime
                                </button>
                              ) : null}
                              {member.status !== "revoked" ? (
                                <button
                                  type="button"
                                  onClick={() => revokeAdminship(member.id)}
                                  disabled={isSaving || member.isPrime}
                                  title={
                                    member.isPrime
                                      ? "Transfer prime adminship first."
                                      : "Revoke this admin account."
                                  }
                                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Revoke
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">No active actions</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
