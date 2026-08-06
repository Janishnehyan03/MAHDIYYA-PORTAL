import { toast } from "react-toastify";

/**
 * Downloads a file from a URL.
 * Handles same-origin/CORS-enabled URLs via Blob, and falls back to
 * Cloudinary fl_attachment or direct anchor download when CORS restricts JS fetch.
 *
 * @param {string} url - The URL of the file to download.
 * @param {string} fileName - The desired name of the downloaded file.
 */
export const downloadFile = async (url, fileName) => {
  if (!url) {
    toast.error("Download URL is missing.");
    return;
  }

  // 1. Try Blob download via fetch
  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      return;
    }
  } catch (err) {
    console.warn("JS fetch download failed (CORS or network error). Attempting direct download fallback:", err);
  }

  // 2. Direct Download / Cloudinary Fallback
  try {
    let targetUrl = url;

    // Append Cloudinary attachment flag if it's a Cloudinary URL and doesn't have it yet
    if (url.includes("res.cloudinary.com") && !url.includes("/fl_attachment")) {
      targetUrl = url.replace("/upload/", "/upload/fl_attachment/");
    }

    const a = document.createElement("a");
    a.href = targetUrl;
    if (fileName) {
      a.download = fileName;
    }
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error("Fallback download failed:", err);
    toast.error("Could not initiate download. Please check your browser settings.");
  }
};
