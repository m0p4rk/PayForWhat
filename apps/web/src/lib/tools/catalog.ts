/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from "zod";

export const toolManifestSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    summary: z.string().min(1),
    status: z.enum(["planned", "building", "published", "retired"]),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    owner: z.string().min(1),
    supportedLocales: z.array(z.enum(["en", "ko"])).min(1),
    processingMode: z.enum(["local", "server", "hybrid"]),
    networkAccess: z.boolean(),
    dataSensitivity: z.enum(["none", "low", "sensitive"]),
    serverCostClass: z.enum(["none", "low", "medium", "high"]),
    outputLabel: z.string().min(1),
  })
  .superRefine((manifest, context) => {
    if (manifest.processingMode === "local" && manifest.networkAccess) {
      context.addIssue({
        code: "custom",
        message: "Local tools cannot declare network access.",
        path: ["networkAccess"],
      });
    }

    if (manifest.processingMode === "local" && manifest.serverCostClass !== "none") {
      context.addIssue({
        code: "custom",
        message: "Local tools cannot declare server cost.",
        path: ["serverCostClass"],
      });
    }
  });

export type ToolManifest = z.infer<typeof toolManifestSchema>;

const catalogInput = [
  {
    id: "image-resizer",
    name: "Image Resizer",
    summary: "Resize, compress, or convert an image to meet upload limits.",
    status: "building",
    slug: "image-resizer",
    owner: "m0p4rk",
    supportedLocales: ["en"],
    processingMode: "local",
    networkAccess: false,
    dataSensitivity: "sensitive",
    serverCostClass: "none",
    outputLabel: "Resized image",
  },
] satisfies ToolManifest[];

export const toolCatalog = catalogInput.map((manifest) =>
  toolManifestSchema.parse(manifest),
);

export const firstTool = toolCatalog[0];
