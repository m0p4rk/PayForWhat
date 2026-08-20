/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";

import { inspectImageBytes } from "./inspect";
import { ImageProcessingError } from "./types";

function jpegFixture() {
  return new Uint8Array([
    0xff, 0xd8, 0xff, 0xe1, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x09, 0x08, 0x02,
    0x58, 0x03, 0x20, 0x03, 0x01, 0xff, 0xd9,
  ]);
}

function multiPictureJpegFixture() {
  const original = jpegFixture();
  const bytes = new Uint8Array(original.length + 8);
  bytes.set(original.slice(0, 2), 0);
  bytes.set([0xff, 0xe2, 0x00, 0x06, 0x4d, 0x50, 0x46, 0x00], 2);
  bytes.set(original.slice(2), 10);
  return bytes;
}

function conflictingJpegFixture() {
  const original = jpegFixture();
  const secondFrame = new Uint8Array([
    0xff, 0xc0, 0x00, 0x09, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03, 0x01,
  ]);
  const bytes = new Uint8Array(original.length + secondFrame.length);
  bytes.set(original.slice(0, -2), 0);
  bytes.set(secondFrame, original.length - 2);
  bytes.set([0xff, 0xd9], original.length - 2 + secondFrame.length);
  return bytes;
}

function pngFixture(
  options: { metadata?: boolean; animated?: boolean; transparency?: boolean } = {},
) {
  const extraChunks =
    Number(Boolean(options.metadata)) +
    Number(Boolean(options.animated)) +
    Number(Boolean(options.transparency));
  const bytes = new Uint8Array(45 + extraChunks * 12);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  bytes.set([0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52], 8);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, 800);
  view.setUint32(20, 600);
  bytes[24] = 8;
  bytes[25] = 6;
  let offset = 33;

  if (options.metadata) {
    bytes.set([0, 0, 0, 0, 0x74, 0x45, 0x58, 0x74], offset);
    offset += 12;
  }

  if (options.animated) {
    bytes.set([0, 0, 0, 0, 0x61, 0x63, 0x54, 0x4c], offset);
    offset += 12;
  }

  if (options.transparency) {
    bytes.set([0, 0, 0, 0, 0x74, 0x52, 0x4e, 0x53], offset);
    offset += 12;
  }

  bytes.set([0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44], offset);
  return bytes;
}

function webpFixture() {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x16, 0x00, 0x00, 0x00], 4);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x58], 12);
  bytes.set([0x0a, 0x00, 0x00, 0x00], 16);
  bytes[20] = 0x12;
  const widthMinusOne = 639;
  const heightMinusOne = 479;
  bytes.set(
    [widthMinusOne & 0xff, (widthMinusOne >> 8) & 0xff, (widthMinusOne >> 16) & 0xff],
    24,
  );
  bytes.set(
    [
      heightMinusOne & 0xff,
      (heightMinusOne >> 8) & 0xff,
      (heightMinusOne >> 16) & 0xff,
    ],
    27,
  );
  return bytes;
}

function conflictingWebpFixture() {
  const extended = webpFixture();
  extended[20] = 0x10;
  const bytes = new Uint8Array(48);
  bytes.set(extended, 0);
  bytes.set([0x28, 0x00, 0x00, 0x00], 4);
  bytes.set([0x56, 0x50, 0x38, 0x20], 30);
  bytes.set([0x0a, 0x00, 0x00, 0x00], 34);
  bytes.set([0x00, 0x00, 0x00, 0x9d, 0x01, 0x2a, 0x01, 0x00, 0x01, 0x00], 38);
  return bytes;
}

describe("image header inspection", () => {
  it("detects JPEG dimensions and application metadata", () => {
    expect(inspectImageBytes(jpegFixture(), 12_345)).toEqual({
      mime: "image/jpeg",
      width: 800,
      height: 600,
      bytes: 12_345,
      hasAlpha: false,
      isAnimated: false,
      hasApplicationMetadata: true,
    });
  });

  // Regression: MPF used to be reported as animation, which made processing
  // reject it outright. Phone cameras write MPF constantly, so that rejected
  // most real photos before a preview could even render.
  it("treats a multi-picture JPEG as metadata-bearing, not animated", () => {
    expect(inspectImageBytes(multiPictureJpegFixture())).toMatchObject({
      mime: "image/jpeg",
      width: 800,
      height: 600,
      isAnimated: false,
      hasApplicationMetadata: true,
    });
  });

  it("rejects conflicting JPEG frame dimensions", () => {
    expect(() => inspectImageBytes(conflictingJpegFixture())).toThrow(
      "conflicting frame dimensions",
    );
  });

  it("detects PNG alpha, text metadata, and animation chunks", () => {
    const inspection = inspectImageBytes(
      pngFixture({ metadata: true, animated: true }),
    );

    expect(inspection).toMatchObject({
      mime: "image/png",
      width: 800,
      height: 600,
      hasAlpha: true,
      hasApplicationMetadata: true,
      isAnimated: true,
    });
  });

  it("detects transparency declared by a PNG tRNS chunk", () => {
    expect(inspectImageBytes(pngFixture({ transparency: true }))).toMatchObject({
      mime: "image/png",
      hasAlpha: true,
    });
  });

  it("detects extended WebP dimensions, alpha, and animation", () => {
    expect(inspectImageBytes(webpFixture())).toMatchObject({
      mime: "image/webp",
      width: 640,
      height: 480,
      hasAlpha: true,
      isAnimated: true,
    });
  });

  it("rejects conflicting static WebP canvas and frame dimensions", () => {
    expect(() => inspectImageBytes(conflictingWebpFixture())).toThrow(
      "conflicting canvas and frame dimensions",
    );
  });

  it("rejects unsupported and truncated formats", () => {
    expect(() => inspectImageBytes(new Uint8Array([0x47, 0x49, 0x46]))).toThrow(
      ImageProcessingError,
    );
    expect(() => inspectImageBytes(jpegFixture().slice(0, 12))).toThrow(
      "segment table is invalid",
    );
  });
});
