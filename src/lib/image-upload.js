export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function validateImageFile(file) {
  if (!(file instanceof File) || file.size === 0) {
    return "Please select an image.";
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are supported.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Each image must be 10 MB or smaller.";
  }

  return null;
}

export async function uploadImage(file) {
  const validationError = validateImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/uploads/images", {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.url) {
    throw new Error(
      result?.message || "The image could not be uploaded. Please try again.",
    );
  }

  return result.url;
}
