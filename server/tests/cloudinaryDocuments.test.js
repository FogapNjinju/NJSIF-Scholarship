const test = require("node:test");
const assert = require("node:assert/strict");
const { createSignedDocumentUrl, getCloudinaryAssetDetails } = require("../utils/cloudinaryDocuments");

const documentUrl = "https://res.cloudinary.com/y9ltibfg/image/upload/v1793791465/njsif-applications/file_gf4dxv.pdf";

test("Cloudinary document URLs are parsed into a constrained asset identity", () => {
  assert.deepEqual(getCloudinaryAssetDetails(documentUrl, "y9ltibfg"), {
    publicId: "njsif-applications/file_gf4dxv",
    format: "pdf",
    resourceType: "image",
    deliveryType: "upload",
  });
});

test("Cloudinary document parsing rejects URLs outside the configured account and folder", () => {
  assert.equal(getCloudinaryAssetDetails(documentUrl, "other-cloud"), null);
  assert.equal(getCloudinaryAssetDetails("https://example.com/njsif-applications/file.pdf", "y9ltibfg"), null);
  assert.equal(
    getCloudinaryAssetDetails("https://res.cloudinary.com/y9ltibfg/image/upload/v12/other-folder/file.pdf", "y9ltibfg"),
    null
  );
});

test("private Cloudinary links are signed and expire after two minutes", () => {
  let signedArguments;
  const cloudinary = {
    utils: {
      private_download_url(...args) {
        signedArguments = args;
        return "https://signed.example/document";
      },
    },
  };
  const now = Date.UTC(2026, 10, 5);

  const signedUrl = createSignedDocumentUrl({ value: documentUrl, cloudName: "y9ltibfg", cloudinary, now, attachment: true });

  assert.equal(signedUrl, "https://signed.example/document");
  assert.deepEqual(signedArguments, ["njsif-applications/file_gf4dxv", "pdf", {
    resource_type: "image",
    type: "upload",
    expires_at: Math.floor(now / 1000) + 120,
    secure: true,
    attachment: true,
  }]);
});