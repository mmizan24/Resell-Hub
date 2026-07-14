"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "resellhub-admin-settings";
const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const INITIAL_FORM = {
  businessName: "ResellHub",
  supportEmail: "",
  supportPhone: "",
  commissionRate: 10,
  payoutHoldDays: 3,
  maintenanceMode: false,
  storefrontAnnouncement: "",
  adminNotes: "",
};

function getSettingsUrl(id) {
  const base = new URL("/admin/settings", BACKEND_ORIGIN);
  if (id) {
    base.pathname = `/admin/settings/${id}`;
  }
  return base.toString();
}

export function AdminSettingsPanel() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [recordId, setRecordId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [hasHydrated, setHasHydrated] = useState(false);

  const settingsMode = useMemo(() => (recordId ? "update" : "create"), [recordId]);

  useEffect(() => {
    let active = true;

    async function hydrateDraft() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        await Promise.resolve();

        if (!active || !raw) return;

        const parsed = JSON.parse(raw);
        if (parsed?.form) {
          setForm((current) => ({ ...current, ...parsed.form }));
        }
        if (parsed?.recordId) {
          setRecordId(parsed.recordId);
        }
      } catch (error) {
        console.error("Unable to restore admin settings draft:", error);
      } finally {
        if (active) {
          setHasHydrated(true);
        }
      }
    }

    void hydrateDraft();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          recordId,
          form,
        })
      );
    } catch (error) {
      console.error("Unable to persist admin settings draft:", error);
    }
  }, [form, hasHydrated, recordId]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetDraft() {
    setForm(INITIAL_FORM);
    setRecordId("");
    setMessage("Draft cleared. You can create a fresh settings record.");
    setMessageType("info");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    if (!form.businessName.trim()) {
      setMessageType("error");
      setMessage("Business name is required.");
      setIsSaving(false);
      return;
    }

    if (!form.supportEmail.trim()) {
      setMessageType("error");
      setMessage("Support email is required.");
      setIsSaving(false);
      return;
    }

    const payload = {
      ...form,
      commissionRate: Number(form.commissionRate) || 0,
      payoutHoldDays: Number(form.payoutHoldDays) || 0,
      maintenanceMode: Boolean(form.maintenanceMode),
      updatedFrom: "admin-dashboard",
    };

    try {
      const url = getSettingsUrl(settingsMode === "update" ? recordId : undefined);
      const response = await fetch(url, {
        method: settingsMode === "update" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Unable to save admin settings.");
      }

      if (result?.insertedId) {
        setRecordId(result.insertedId);
      }

      setMessageType("success");
      setMessage(
        settingsMode === "update"
          ? "Admin settings updated successfully."
          : "Admin settings created successfully."
      );
    } catch (error) {
      setMessageType("error");
      setMessage(error?.message || "Unable to save admin settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="settings" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Admin role</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-950">Platform settings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create or update the main admin record that controls the platform-level settings your backend stores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            Mode: {settingsMode}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            Record: {recordId ? recordId : "new"}
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

      <form className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Business name
              <input
                type="text"
                value={form.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isSaving}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Support email
              <input
                type="email"
                value={form.supportEmail}
                onChange={(event) => updateField("supportEmail", event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isSaving}
                placeholder="support@resellhub.com"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Support phone
              <input
                type="tel"
                value={form.supportPhone}
                onChange={(event) => updateField("supportPhone", event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isSaving}
                placeholder="+880 1X XX XX XX XX"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Commission rate
              <input
                type="number"
                min="0"
                max="100"
                value={form.commissionRate}
                onChange={(event) => updateField("commissionRate", event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isSaving}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Payout hold days
              <input
                type="number"
                min="0"
                value={form.payoutHoldDays}
                onChange={(event) => updateField("payoutHoldDays", event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isSaving}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Storefront announcement
            <textarea
              rows={4}
              value={form.storefrontAnnouncement}
              onChange={(event) => updateField("storefrontAnnouncement", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              disabled={isSaving}
              placeholder="Example: Free delivery on selected categories this week."
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Admin notes
            <textarea
              rows={4}
              value={form.adminNotes}
              onChange={(event) => updateField("adminNotes", event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              disabled={isSaving}
              placeholder="Internal notes for other admins."
            />
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Control switches</h3>
            <p className="mt-1 text-sm text-slate-600">
              These settings are stored in your backend admin record.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(event) => updateField("maintenanceMode", event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
              disabled={isSaving}
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">Maintenance mode</span>
              <span className="mt-1 block text-sm text-slate-600">
                Temporarily show a maintenance state while admins work on the platform.
              </span>
            </span>
          </label>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">How it works</p>
            <p className="mt-2">
              The first save creates a new document with `POST /admin/settings`. After that, the browser remembers
              the inserted id and future saves use `PUT /admin/settings/:id`.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving settings..." : settingsMode === "update" ? "Update settings" : "Create settings"}
            </button>

            <button
              type="button"
              onClick={resetDraft}
              disabled={isSaving}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset draft
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
