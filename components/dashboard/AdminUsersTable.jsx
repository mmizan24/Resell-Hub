"use client";

import { useEffect, useMemo, useState } from "react";
import { PaginationControls } from "../../src/components/ui/PaginationControls";
import { paginateItems } from "../../src/lib/pagination";

const EMPTY_USER = {
  id: "",
  name: "",
  email: "",
  role: "buyer",
  phoneNumber: "",
  location: "",
  staus: "",
};

function displayValue(value) {
  return value || "N/A";
}

export function AdminUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [message, setMessage] = useState("");
  const [activeRole, setActiveRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  async function fetchUsers() {
    const res = await fetch("/api/admin/users", { credentials: "include" });
    const json = await res.json();

    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Unable to load users right now.");
    }

    return json.data || [];
  }

  useEffect(() => {
    let active = true;

    async function loadUsersAsync() {
      try {
        const data = await fetchUsers();
        if (active) {
          setUsers(data);
        }
      } catch (error) {
        if (active) {
          setMessage(error.message || "Unable to load users right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUsersAsync();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    if (activeRole === "all") return true;
    return (user.role || "buyer") === activeRole;
  });

  const paginatedUsers = useMemo(
    () => paginateItems(filteredUsers, currentPage, pageSize),
    [currentPage, filteredUsers],
  );

  function startEdit(user) {
    setEditingId(user.id);
    setForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role || "buyer",
      phoneNumber: user.phoneNumber || "",
      location: user.location || "",
      staus: user.staus || "",
    });
  }

  async function saveUser() {
    if (!editingId) return;
    setMessage("");

    try {
      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          phoneNumber: form.phoneNumber,
          location: form.location,
          staus: form.staus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Update failed");
      setMessage("Profile updated successfully.");
      setEditingId(null);
      setUsers(await fetchUsers());
    } catch (error) {
      setMessage(error.message || "Unable to update profile.");
    }
  }

  return (
    <section id="users" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-950">Seller & buyer profiles</h2>
          <p className="mt-1 text-sm text-slate-600">View and edit all seller, buyer, and admin accounts from one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm ${activeRole === "all" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setActiveRole("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm ${activeRole === "seller" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setActiveRole("seller")}
          >
            Sellers
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm ${activeRole === "buyer" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"}`}
            onClick={() => setActiveRole("buyer")}
          >
            Buyers
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p> : null}

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">Loading profiles...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No profiles found for this group.</p>
      ) : (
        <>
          <div className="mt-5 space-y-3 md:hidden">
            {paginatedUsers.items.map((user) => (
              <article key={user.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                {editingId === user.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
                        <input
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.name}
                          onChange={(event) => setForm({ ...form, name: event.target.value })}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                        <input
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.email}
                          onChange={(event) => setForm({ ...form, email: event.target.value })}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
                        <select
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.role}
                          onChange={(event) => setForm({ ...form, role: event.target.value })}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</span>
                        <input
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          value={form.phoneNumber}
                          onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
                        />
                      </label>
                    </div>
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</span>
                      <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        value={form.location}
                        onChange={(event) => setForm({ ...form, location: event.target.value })}
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={saveUser}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{displayValue(user.name)}</div>
                        <div className="mt-1 text-sm text-slate-600">{displayValue(user.email)}</div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                        {user.role || "buyer"}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-slate-400">Phone</span>
                        {displayValue(user.phoneNumber)}
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-slate-400">Location</span>
                        {displayValue(user.location)}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700"
                        onClick={() => startEdit(user)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedUsers.items.map((user) => (
                    <tr key={user.id} className="align-top">
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1"
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                          />
                        ) : (
                          <div className="font-semibold text-slate-900">{displayValue(user.name)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <input
                            className="w-full rounded border border-slate-300 px-2 py-1"
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                          />
                        ) : (
                          displayValue(user.email)
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <select
                            className="w-full rounded border border-slate-300 px-2 py-1"
                            value={form.role}
                            onChange={(event) => setForm({ ...form, role: event.target.value })}
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                            {user.role || "buyer"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{editingId === user.id ? (
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1"
                          value={form.phoneNumber}
                          onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
                        />
                      ) : (
                        displayValue(user.phoneNumber)
                      )}</td>
                      <td className="px-4 py-3">{editingId === user.id ? (
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1"
                          value={form.location}
                          onChange={(event) => setForm({ ...form, location: event.target.value })}
                        />
                      ) : (
                        displayValue(user.location)
                      )}</td>
                      <td className="px-4 py-3">
                        {editingId === user.id ? (
                          <div className="flex gap-2">
                            <button type="button" className="rounded bg-blue-700 px-3 py-1.5 text-white" onClick={saveUser}>
                              Save
                            </button>
                            <button type="button" className="rounded border px-3 py-1.5" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button type="button" className="rounded border border-blue-200 px-3 py-1.5 text-blue-700" onClick={() => startEdit(user)}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {paginatedUsers.totalPages > 1 ? (
        <PaginationControls
          page={paginatedUsers.page}
          totalPages={paginatedUsers.totalPages}
          totalItems={paginatedUsers.totalItems}
          startIndex={paginatedUsers.startIndex}
          endIndex={paginatedUsers.endIndex}
          itemLabel="users"
          onPageChange={setCurrentPage}
        />
      ) : null}
    </section>
  );
}
