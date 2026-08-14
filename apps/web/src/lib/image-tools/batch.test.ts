/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";

import { createUniqueArchiveFilename, LocalZipArchive } from "./batch";

describe("batch archive filenames", () => {
  it("keeps the first filename and numbers later collisions", () => {
    expect(createUniqueArchiveFilename("photo-ready.jpg", new Set())).toBe(
      "photo-ready.jpg",
    );
    expect(
      createUniqueArchiveFilename("photo-ready.jpg", new Set(["photo-ready.jpg"])),
    ).toBe("photo-ready-2.jpg");
    expect(
      createUniqueArchiveFilename(
        "photo-ready.jpg",
        new Set(["photo-ready.jpg", "photo-ready-2.jpg"]),
      ),
    ).toBe("photo-ready-3.jpg");
  });

  it("creates a readable stored ZIP archive", async () => {
    const archive = new LocalZipArchive();
    await archive.add("first.txt", new Blob(["first file"]));
    await archive.add("second.txt", new Blob(["second file"]));

    const blob = await archive.finish();
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));

    expect(strFromU8(files["first.txt"]!)).toBe("first file");
    expect(strFromU8(files["second.txt"]!)).toBe("second file");
  });
});
