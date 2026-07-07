"use client";

import { uploadImage, validateImageFile } from "@/lib/image-upload";
import { useActionState, useEffect, useRef } from "react";

const INITIAL_STATE = { success: false, message: "" };

const CATEGORIES = [
  "Electronics",
  "Mobile Phones",
  "Fashion",
  "Furniture",
  "Vehicles",
  "Home & Living",
  "Sports",
  "Books",
  "Other",
];

async function createProductWithImages(_previousState, formData) {
  const imageFiles = formData
    .getAll("imageFiles")
    .filter((file) => file instanceof File && file.size > 0);

  if (imageFiles.length === 0 || imageFiles.length > 8) {
    return {
      success: false,
      message: "Select between 1 and 8 product images.",
    };
  }

  for (const imageFile of imageFiles) {
    const validationError = validateImageFile(imageFile);
    if (validationError) {
      return { success: false, message: validationError };
    }
  }

  try {
    const imageUrls = await Promise.all(imageFiles.map(uploadImage));
    const response = await fetch("/api/seller/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("title"),
        category: formData.get("category"),
        condition: formData.get("condition"),
        price: Number(formData.get("price")),
        images: imageUrls,
        description: formData.get("description"),
        status: formData.get("status"),
      }),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "The product could not be saved.");
    }

    return {
      success: true,
      message: result.message || "Product added successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "The product images could not be uploaded.",
    };
  }
}

export function ProductForm({ seller }) {
  const [state, formAction, isPending] = useActionState(
    createProductWithImages,
    INITIAL_STATE,
  );
  const formRef = useRef(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      window.dispatchEvent(new Event("seller-products-changed"));
    }
  }, [state]);

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70";

  return (
    <div
      id="add-product"
      className="mt-8 scroll-mt-24 rounded-xl border border-blue-100 bg-white p-5 shadow-sm md:p-7"
    >
      <div className="border-b border-slate-100 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          New listing
        </p>
        <h2 className="mt-1 text-2xl font-bold text-blue-950">Add a product</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add the product details and upload clear photos buyers should see.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="mt-6 space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Product title
            <input
              type="text"
              name="title"
              minLength={3}
              maxLength={120}
              required
              disabled={isPending}
              placeholder="Used Dell Inspiron 15 Laptop"
              className={fieldClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              name="category"
              defaultValue=""
              required
              disabled={isPending}
              className={fieldClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Condition
            <select
              name="condition"
              defaultValue="Good"
              required
              disabled={isPending}
              className={fieldClass}
            >
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Price (BDT)
            <input
              type="number"
              name="price"
              min="1"
              step="1"
              inputMode="numeric"
              required
              disabled={isPending}
              placeholder="35000"
              className={fieldClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Status
            <select
              name="status"
              defaultValue="available"
              required
              disabled={isPending}
              className={fieldClass}
            >
              <option value="available">Available</option>
              <option value="out of stock">Out of stock</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Description
            <textarea
              name="description"
              minLength={10}
              maxLength={2000}
              rows={5}
              required
              disabled={isPending}
              placeholder="Describe the model, specifications, age, and any signs of use."
              className={fieldClass}
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Product images
          <input
            type="file"
            name="imageFiles"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            disabled={isPending}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
          />
          <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500">
            Select 1–8 JPEG, PNG, or WebP files. Maximum 10 MB each. Images
            are uploaded to ImgBB.
          </span>
        </label>

        <div className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Seller information
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            This is securely taken from your signed-in account.
          </p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-800">{seller.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="break-all font-medium text-slate-800">
                {seller.email}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="font-medium text-slate-800">
                {seller.phoneNumber || "Not provided"}
              </dd>
            </div>
          </dl>
        </div>

        {state.message && (
          <p
            role="status"
            aria-live="polite"
            className={`rounded-lg px-4 py-3 text-sm ${
              state.success
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isPending ? "Uploading images and saving..." : "Add product"}
        </button>
      </form>
    </div>
  );
}
