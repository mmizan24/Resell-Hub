"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage, validateImageFile } from "@/lib/image-upload";

export function ProfileEditor({ user }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    location: user?.location || "dhaka",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    if (!formData.name.trim()) {
      setMessage("Please enter your full name.");
      setIsSaving(false);
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setMessage("Please enter your phone number.");
      setIsSaving(false);
      return;
    }

    try {
      let imageUrl;

      if (selectedImage) {
        const imageError = validateImageFile(selectedImage);
        if (imageError) {
          setMessage(imageError);
          setIsSaving(false);
          return;
        }

        imageUrl = await uploadImage(selectedImage);
      }

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          location: formData.location,
          image: imageUrl,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Unable to update your profile right now.");
      }

      setMessage("Profile updated successfully.");
      setSelectedImage(null);
      router.refresh();
    } catch (error) {
      setMessage(error.message || "Unable to update your profile right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "Profile"}
                width={56}
                height={56}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{(user?.name || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-950">Your profile</h2>
            <p className="mt-1 text-sm text-slate-600">
              Update your name, phone number, location, and profile image.
            </p>
          </div>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          {user?.role === "seller" ? "Seller account" : "Buyer account"}
        </div>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Full name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={isSaving}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Phone number
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={isSaving}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Location
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={isSaving}
          >
            <option value="dhaka">Dhaka</option>
            <option value="chittagong">Chittagong</option>
            <option value="khulna">Khulna</option>
            <option value="rajshahi">Rajshahi</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Profile image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={isSaving}
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving profile..." : "Save profile"}
          </button>
        </div>
      </form>

      {message ? (
        <p className={`mt-4 text-sm ${message.includes("success") ? "text-emerald-700" : "text-red-700"}`}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
