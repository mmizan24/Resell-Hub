"use client";

import { uploadImage, validateImageFile } from "@/lib/image-upload";
import Image from "next/image";
import { useEffect, useState } from "react";

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

export function SellerProductsTable() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/seller/products", {
          cache: "no-store",
        });
        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Products could not be loaded.");
        }

        if (isActive) {
          setProducts(result.data);
          setLoadError("");
        }
      } catch (error) {
        if (isActive) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Products could not be loaded.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();
    window.addEventListener("seller-products-changed", loadProducts);

    return () => {
      isActive = false;
      window.removeEventListener("seller-products-changed", loadProducts);
    };
  }, []);

  async function handleUpdate(event) {
    event.preventDefault();
    setSaveError("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const replacementImages = formData
      .getAll("imageFiles")
      .filter((file) => file instanceof File && file.size > 0);

    if (replacementImages.length > 8) {
      setSaveError("Select no more than 8 replacement images.");
      setIsSaving(false);
      return;
    }

    for (const image of replacementImages) {
      const validationError = validateImageFile(image);

      if (validationError) {
        setSaveError(validationError);
        setIsSaving(false);
        return;
      }
    }

    try {
      const images =
        replacementImages.length > 0
          ? await Promise.all(replacementImages.map(uploadImage))
          : editingProduct.images;
      const response = await fetch(
        `/api/seller/products/${editingProduct._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.get("title"),
            category: formData.get("category"),
            condition: formData.get("condition"),
            price: Number(formData.get("price")),
            images,
            description: formData.get("description"),
            status: formData.get("status"),
          }),
        },
      );
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "The product could not be updated.");
      }

      setProducts((current) =>
        current.map((product) =>
          product._id === result.data._id ? result.data : product,
        ),
      );
      setEditingProduct(null);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "The product could not be updated.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="my-products" className="mt-10 scroll-mt-24">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Inventory
        </p>
        <h2 className="mt-1 text-2xl font-bold text-blue-950">My products</h2>
        <p className="mt-2 text-sm text-slate-600">
          This table is loaded from the server API and contains only products
          owned by your seller account.
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading your products...
          </p>
        ) : loadError ? (
          <p role="alert" className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            You have not added any products yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Product
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Price
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="min-w-64 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt=""
                              fill
                              unoptimized
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {product.condition}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {product.category}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700">
                      ৳ {Number(product.price).toLocaleString("en-BD")}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.status === "available"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.status === "available"
                          ? "Available"
                          : "Out of stock"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSaveError("");
                          setEditingProduct(product);
                        }}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingProduct && (
        <EditProductDialog
          key={editingProduct._id}
          product={editingProduct}
          isSaving={isSaving}
          error={saveError}
          onClose={() => {
            if (!isSaving) {
              setEditingProduct(null);
              setSaveError("");
            }
          }}
          onSubmit={handleUpdate}
        />
      )}
    </section>
  );
}

function EditProductDialog({
  product,
  isSaving,
  error,
  onClose,
  onSubmit,
}) {
  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:opacity-70";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-product-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Edit listing
            </p>
            <h2
              id="edit-product-title"
              className="mt-1 text-2xl font-bold text-blue-950"
            >
              {product.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Product title
            <input
              name="title"
              defaultValue={product.title}
              minLength={3}
              maxLength={120}
              required
              disabled={isSaving}
              className={fieldClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              name="category"
              defaultValue={product.category}
              required
              disabled={isSaving}
              className={fieldClass}
            >
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
              defaultValue={product.condition}
              required
              disabled={isSaving}
              className={fieldClass}
            >
              {["New", "Like New", "Good", "Fair", "Poor"].map(
                (condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Price (BDT)
            <input
              type="number"
              name="price"
              defaultValue={product.price}
              min="1"
              step="1"
              required
              disabled={isSaving}
              className={fieldClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Status
            <select
              name="status"
              defaultValue={product.status}
              required
              disabled={isSaving}
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
              defaultValue={product.description}
              minLength={10}
              maxLength={2000}
              rows={5}
              required
              disabled={isSaving}
              className={fieldClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Replace product images (optional)
            <input
              type="file"
              name="imageFiles"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={isSaving}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700"
            />
            <span className="mt-1.5 block text-xs font-normal text-slate-500">
              Leave empty to keep the existing {product.images.length} image(s),
              or select up to 8 replacements for ImgBB.
            </span>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 md:col-span-2"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
