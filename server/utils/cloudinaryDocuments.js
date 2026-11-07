const getCloudinaryAssetDetails = (value, cloudName) => {
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return null;

  let segments;
  try {
    segments = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch (error) {
    return null;
  }

  const [urlCloudName, resourceType, deliveryType, ...assetSegments] = segments;
  if (
    urlCloudName !== cloudName ||
    !["image", "raw", "video"].includes(resourceType) ||
    !["upload", "private", "authenticated"].includes(deliveryType)
  ) {
    return null;
  }

  const versionIndex = assetSegments.findIndex((segment) => /^v\d+$/.test(segment));
  if (versionIndex < 0) return null;

  const assetPath = assetSegments.slice(versionIndex + 1).join("/");
  const extensionIndex = assetPath.lastIndexOf(".");
  if (extensionIndex < 0) return null;

  const publicId = assetPath.slice(0, extensionIndex);
  const format = assetPath.slice(extensionIndex + 1).toLowerCase();
  if (!publicId.startsWith("njsif-applications/") || !/^[a-z0-9]+$/i.test(format)) return null;

  return { publicId, format, resourceType, deliveryType };
};

const createSignedDocumentUrl = ({
  value,
  cloudName,
  cloudinary,
  attachment = false,
  now = Date.now(),
}) => {
  const asset = getCloudinaryAssetDetails(value, cloudName);
  if (!asset) return null;

  return cloudinary.utils.private_download_url(asset.publicId, asset.format, {
    resource_type: asset.resourceType,
    type: asset.deliveryType,
    expires_at: Math.floor(now / 1000) + 120,
    secure: true,
    ...(attachment ? { attachment: true } : {}),
  });
};

module.exports = { createSignedDocumentUrl, getCloudinaryAssetDetails };