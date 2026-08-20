/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  ImageProcessingError,
  type ImageInspection,
  type SupportedImageMime,
} from "./types";

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function readUint24LittleEndian(bytes: Uint8Array, offset: number) {
  return bytes[offset]! | (bytes[offset + 1]! << 8) | (bytes[offset + 2]! << 16);
}

function tag(bytes: Uint8Array, offset: number) {
  return String.fromCharCode(...bytes.subarray(offset, offset + 4));
}

function parseJpeg(bytes: Uint8Array, totalBytes: number): ImageInspection {
  let offset = 2;
  let width = 0;
  let height = 0;
  let hasApplicationMetadata = false;

  while (offset + 3 < bytes.length) {
    while (offset < bytes.length && bytes[offset] !== 0xff) {
      offset += 1;
    }

    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1;
    }

    if (offset >= bytes.length) {
      break;
    }

    const marker = bytes[offset]!;
    offset += 1;

    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) {
      continue;
    }

    if (marker === 0xda) {
      break;
    }

    if (offset + 1 >= bytes.length) {
      break;
    }

    const segmentLength = (bytes[offset]! << 8) | bytes[offset + 1]!;
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      throw new ImageProcessingError(
        "invalid_image",
        "The JPEG segment table is invalid.",
      );
    }

    if (marker === 0xe1 || marker === 0xed) {
      hasApplicationMetadata = true;
    }

    // Multi-Picture Format (APP2/MPF) carries extra still images — a thumbnail,
    // a depth map, the second lens — alongside the primary one. Phones write it
    // constantly. It is application metadata, not animation: the primary image
    // decodes normally and re-encoding simply drops the extras, which is what a
    // resizer is expected to do. Treating it as animation rejected most phone
    // photos outright.
    if (marker === 0xe2 && tag(bytes, offset + 2) === "MPF\u0000") {
      hasApplicationMetadata = true;
    }

    if (JPEG_START_OF_FRAME_MARKERS.has(marker) && segmentLength >= 7) {
      const frameHeight = (bytes[offset + 3]! << 8) | bytes[offset + 4]!;
      const frameWidth = (bytes[offset + 5]! << 8) | bytes[offset + 6]!;

      if (width > 0 && (width !== frameWidth || height !== frameHeight)) {
        throw new ImageProcessingError(
          "invalid_image",
          "The JPEG contains conflicting frame dimensions.",
        );
      }

      width = frameWidth;
      height = frameHeight;
    }

    offset += segmentLength;
  }

  if (width < 1 || height < 1) {
    throw new ImageProcessingError("invalid_image", "The JPEG dimensions are missing.");
  }

  return {
    mime: "image/jpeg",
    width,
    height,
    bytes: totalBytes,
    hasAlpha: false,
    // JPEG is a single-image format; nothing inside a .jpg animates.
    isAnimated: false,
    hasApplicationMetadata,
  };
}

function parsePng(bytes: Uint8Array, totalBytes: number): ImageInspection {
  if (bytes.length < 33 || tag(bytes, 12) !== "IHDR") {
    throw new ImageProcessingError("invalid_image", "The PNG header is invalid.");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  const colorType = bytes[25]!;
  let hasAlpha = colorType === 4 || colorType === 6;
  let offset = 8;
  let isAnimated = false;
  let hasApplicationMetadata = false;

  while (offset + 12 <= bytes.length) {
    const chunkLength = view.getUint32(offset);
    const chunkType = tag(bytes, offset + 4);
    const nextOffset = offset + 12 + chunkLength;

    if (nextOffset > bytes.length) {
      throw new ImageProcessingError(
        "invalid_image",
        "The PNG chunk table is invalid.",
      );
    }

    isAnimated ||= chunkType === "acTL";
    hasAlpha ||= chunkType === "tRNS";
    hasApplicationMetadata ||= ["eXIf", "iTXt", "tEXt", "zTXt"].includes(chunkType);
    offset = nextOffset;

    if (chunkType === "IEND") {
      break;
    }
  }

  if (width < 1 || height < 1) {
    throw new ImageProcessingError("invalid_image", "The PNG dimensions are invalid.");
  }

  return {
    mime: "image/png",
    width,
    height,
    bytes: totalBytes,
    hasAlpha,
    isAnimated,
    hasApplicationMetadata,
  };
}

function parseWebp(bytes: Uint8Array, totalBytes: number): ImageInspection {
  let offset = 12;
  let width = 0;
  let height = 0;
  let hasAlpha = false;
  let isAnimated = false;
  let hasApplicationMetadata = false;
  let hasExtendedCanvas = false;

  while (offset + 8 <= bytes.length) {
    const chunkType = tag(bytes, offset);
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset + 4, 4);
    const chunkLength = view.getUint32(0, true);
    const dataOffset = offset + 8;
    const nextOffset = dataOffset + chunkLength + (chunkLength % 2);

    if (nextOffset > bytes.length) {
      throw new ImageProcessingError(
        "invalid_image",
        "The WebP chunk table is invalid.",
      );
    }

    if (chunkType === "VP8X" && chunkLength >= 10) {
      const flags = bytes[dataOffset]!;
      hasAlpha ||= (flags & 0x10) !== 0;
      isAnimated ||= (flags & 0x02) !== 0;
      width = readUint24LittleEndian(bytes, dataOffset + 4) + 1;
      height = readUint24LittleEndian(bytes, dataOffset + 7) + 1;
      hasExtendedCanvas = true;
    } else if (chunkType === "VP8L" && chunkLength >= 5) {
      if (bytes[dataOffset] !== 0x2f) {
        throw new ImageProcessingError(
          "invalid_image",
          "The lossless WebP header is invalid.",
        );
      }
      const bits =
        bytes[dataOffset + 1]! |
        (bytes[dataOffset + 2]! << 8) |
        (bytes[dataOffset + 3]! << 16) |
        (bytes[dataOffset + 4]! << 24);
      const frameWidth = (bits & 0x3fff) + 1;
      const frameHeight = ((bits >>> 14) & 0x3fff) + 1;
      if (
        hasExtendedCanvas &&
        (width !== frameWidth || height !== frameHeight) &&
        !isAnimated
      ) {
        throw new ImageProcessingError(
          "invalid_image",
          "The WebP contains conflicting canvas and frame dimensions.",
        );
      }
      if (!hasExtendedCanvas) {
        width = frameWidth;
        height = frameHeight;
      }
      hasAlpha = true;
    } else if (chunkType === "VP8 " && chunkLength >= 10) {
      if (
        bytes[dataOffset + 3] !== 0x9d ||
        bytes[dataOffset + 4] !== 0x01 ||
        bytes[dataOffset + 5] !== 0x2a
      ) {
        throw new ImageProcessingError(
          "invalid_image",
          "The WebP frame header is invalid.",
        );
      }
      const frameWidth =
        (bytes[dataOffset + 6]! | (bytes[dataOffset + 7]! << 8)) & 0x3fff;
      const frameHeight =
        (bytes[dataOffset + 8]! | (bytes[dataOffset + 9]! << 8)) & 0x3fff;
      if (
        hasExtendedCanvas &&
        (width !== frameWidth || height !== frameHeight) &&
        !isAnimated
      ) {
        throw new ImageProcessingError(
          "invalid_image",
          "The WebP contains conflicting canvas and frame dimensions.",
        );
      }
      if (!hasExtendedCanvas) {
        width = frameWidth;
        height = frameHeight;
      }
    }

    isAnimated ||= chunkType === "ANIM" || chunkType === "ANMF";
    hasApplicationMetadata ||= chunkType === "EXIF" || chunkType === "XMP ";
    offset = nextOffset;
  }

  if (width < 1 || height < 1) {
    throw new ImageProcessingError("invalid_image", "The WebP dimensions are missing.");
  }

  return {
    mime: "image/webp",
    width,
    height,
    bytes: totalBytes,
    hasAlpha,
    isAnimated,
    hasApplicationMetadata,
  };
}

export function inspectImageBytes(
  bytes: Uint8Array,
  totalBytes = bytes.byteLength,
): ImageInspection {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return parseJpeg(bytes, totalBytes);
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    tag(bytes, 1) === "PNG\r" &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return parsePng(bytes, totalBytes);
  }

  if (bytes.length >= 12 && tag(bytes, 0) === "RIFF" && tag(bytes, 8) === "WEBP") {
    return parseWebp(bytes, totalBytes);
  }

  throw new ImageProcessingError(
    "unsupported_format",
    "Choose a static JPEG, PNG, or WebP image. Renaming a file does not convert it.",
  );
}

export async function inspectImage(file: Blob) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return inspectImageBytes(bytes, file.size);
}

export function mimeLabel(mime: SupportedImageMime) {
  if (mime === "image/jpeg") return "JPEG";
  if (mime === "image/png") return "PNG";
  return "WebP";
}
