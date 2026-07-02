import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/image-upload";

const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT_MAX_UPLOADS = 20;
const globalForUploads = globalThis;

if (!globalForUploads.imgbbUploadAttempts) {
  globalForUploads.imgbbUploadAttempts = new Map();
}

function getClientAddress(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(request) {
  const now = Date.now();
  const address = getClientAddress(request);
  const attempts = globalForUploads.imgbbUploadAttempts.get(address) || [];
  const recentAttempts = attempts.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_UPLOADS) {
    globalForUploads.imgbbUploadAttempts.set(address, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  globalForUploads.imgbbUploadAttempts.set(address, recentAttempts);
  return false;
}

function hasValidSignature(bytes, type) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((byte, index) => bytes[index] === byte);
  }

  if (type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

function safeFileName(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request) {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    return Response.json(
      { message: "Image uploads are not configured." },
      { status: 503 },
    );
  }

  if (isRateLimited(request)) {
    return Response.json(
      { message: "Too many image uploads. Please wait and try again." },
      { status: 429 },
    );
  }

  let formData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { message: "The image upload request is invalid." },
      { status: 400 },
    );
  }

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return Response.json(
      { message: "Please select an image." },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return Response.json(
      { message: "Only JPEG, PNG, and WebP images are supported." },
      { status: 415 },
    );
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return Response.json(
      { message: "Each image must be 10 MB or smaller." },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await image.arrayBuffer());

  if (!hasValidSignature(bytes, image.type)) {
    return Response.json(
      { message: "The selected file is not a valid image." },
      { status: 415 },
    );
  }

  const uploadData = new FormData();
  uploadData.append(
    "image",
    new Blob([bytes], { type: image.type }),
    image.name,
  );

  const name = safeFileName(image.name);
  if (name) {
    uploadData.append("name", name);
  }

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadData,
        cache: "no-store",
      },
    );
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success || !result?.data?.url) {
      console.error("ImgBB upload failed with status:", response.status);
      return Response.json(
        { message: "ImgBB could not store the image. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({
      url: result.data.url,
    });
  } catch (error) {
    console.error("Unable to reach ImgBB:", error);
    return Response.json(
      { message: "The image service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}
