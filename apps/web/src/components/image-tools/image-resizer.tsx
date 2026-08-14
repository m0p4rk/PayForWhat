"use client";

/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  ImagesIcon,
  ImageSquareIcon,
  ResizeIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

import {
  IMAGE_LIMITS,
  SUPPORTED_IMAGE_MIME_TYPES,
  type ImagePreviewResult,
  type ImageRequirements,
  type ImageWorkerResponse,
  type ProcessedImageBatchResult,
  type ProcessedImageResult,
  type SupportedImageMime,
} from "@/lib/image-tools/types";

type ResizeMode = "keep" | "max" | "exact";
type ToolState = "empty" | "ready" | "processing" | "success" | "error";
type WorkerState = "starting" | "ready" | "failed";
type PreviewState = "empty" | "waiting" | "loading" | "ready" | "error";
type ToolResult =
  | { kind: "single"; data: ProcessedImageResult }
  | { kind: "batch"; data: ProcessedImageBatchResult };

const STAGE_LABELS = {
  inspecting: "Checking the image",
  decoding: "Opening the image",
  rendering: "Resizing the image",
  optimizing: "Reducing the file size",
  validating: "Final check",
} as const;

const FORMAT_OPTIONS: { label: string; value: SupportedImageMime }[] = [
  { label: "JPEG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
  { label: "WebP", value: "image/webp" },
];

const RESIZE_MODE_OPTIONS: { label: string; value: ResizeMode }[] = [
  { label: "Keep size", value: "keep" },
  { label: "Max size", value: "max" },
  { label: "Exact size", value: "exact" },
];

function formatBytes(bytes: number) {
  const exact = `${bytes.toLocaleString("en-US")} bytes`;
  if (bytes < 1000) return exact;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB (${exact})`;
  return `${(bytes / 1_000_000).toFixed(2)} MB (${exact})`;
}

function formatCompactBytes(bytes: number) {
  if (bytes < 1000) return `${bytes} bytes`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

function fieldClassName(withTopMargin = true) {
  return `${withTopMargin ? "mt-2 " : ""}h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm text-[var(--ink)] outline-none transition-[border-color,box-shadow] focus:border-[var(--ink)] focus:shadow-[0_0_0_3px_rgba(27,24,19,0.08)]`;
}

function parsePositiveInteger(value: string, label: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > IMAGE_LIMITS.maxOutputSide) {
    throw new Error(`${label} must be a whole number from 1 to 8,192.`);
  }
  return parsed;
}

export function ImageResizer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const filesRef = useRef<File[]>([]);
  const activeRequestIdRef = useRef<string | null>(null);
  const previewRequestIdRef = useRef<string | null>(null);
  const outputUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImagePreviewResult | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>("empty");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [toolState, setToolState] = useState<ToolState>("empty");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [workerState, setWorkerState] = useState<WorkerState>("starting");

  const [outputMime, setOutputMime] = useState<SupportedImageMime>("image/jpeg");
  const [resizeMode, setResizeMode] = useState<ResizeMode>("max");
  const [width, setWidth] = useState("1200");
  const [height, setHeight] = useState("1200");
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [allowUpscale, setAllowUpscale] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [maximumKilobytes, setMaximumKilobytes] = useState("");

  const primaryFile = files[0] ?? null;
  const selectedBytes = files.reduce((total, file) => total + file.size, 0);

  function revokeOutputUrl() {
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
  }

  function revokePreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function clearResult() {
    revokeOutputUrl();
    setOutputUrl(null);
    setResult(null);
  }

  function clearPreview() {
    revokePreviewUrl();
    setPreviewUrl(null);
    setPreview(null);
    previewRequestIdRef.current = null;
  }

  function invalidateResultForRuleChange() {
    clearResult();
    setStatusMessage("");
    if (workerState === "failed") {
      setToolState("error");
      return;
    }
    setErrorMessage("");
    setToolState(files.length > 0 ? "ready" : "empty");
  }

  const requestPreview = useCallback((file: File) => {
    const worker = workerRef.current;
    if (!worker) {
      setPreviewState("waiting");
      return;
    }

    const requestId = crypto.randomUUID();
    previewRequestIdRef.current = requestId;
    setPreviewState("loading");
    worker.postMessage({ type: "preview", requestId, file });
  }, []);

  const initializeWorker = useCallback(() => {
    let worker: Worker;
    try {
      worker = new Worker(
        new URL("../../workers/image-processor.worker.ts", import.meta.url),
        { type: "module" },
      );
    } catch {
      workerRef.current = null;
      queueMicrotask(() => {
        setWorkerState("failed");
        setPreviewState(filesRef.current.length > 0 ? "error" : "empty");
        setToolState("error");
        setErrorMessage(
          "The image tool could not start in this browser. Please try again.",
        );
      });
      return;
    }
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<ImageWorkerResponse>) => {
      const response = event.data;

      if (response.type === "ready") {
        if (workerRef.current === worker) setWorkerState("ready");
        return;
      }

      if (response.type === "preview_success" || response.type === "preview_error") {
        if (response.requestId !== previewRequestIdRef.current) return;
        previewRequestIdRef.current = null;

        if (response.type === "preview_error") {
          setPreviewState("error");
          setToolState("error");
          setErrorMessage(response.error.message);
          return;
        }

        revokePreviewUrl();
        const nextPreviewUrl = URL.createObjectURL(response.result.blob);
        previewUrlRef.current = nextPreviewUrl;
        setPreviewUrl(nextPreviewUrl);
        setPreview(response.result);
        setPreviewState("ready");
        setToolState("ready");
        setErrorMessage("");
        return;
      }

      if (response.requestId !== activeRequestIdRef.current) return;

      if (response.type === "progress") {
        setStatusMessage(STAGE_LABELS[response.stage]);
        return;
      }

      if (response.type === "batch_progress") {
        setStatusMessage(
          `${response.fileIndex + 1} of ${response.fileCount} · ${STAGE_LABELS[response.stage]}`,
        );
        return;
      }

      activeRequestIdRef.current = null;

      if (response.type === "error") {
        setToolState("error");
        setStatusMessage("");
        setErrorMessage(response.error.message);
        return;
      }

      revokeOutputUrl();
      const nextUrl = URL.createObjectURL(response.result.blob);
      outputUrlRef.current = nextUrl;
      setOutputUrl(nextUrl);

      if (response.type === "batch_success") {
        setResult({ kind: "batch", data: response.result });
        setStatusMessage(`${response.result.succeeded} images are ready`);
      } else {
        setResult({ kind: "single", data: response.result });
        setStatusMessage("Your image is ready");
      }

      setToolState("success");
      requestAnimationFrame(() => resultRef.current?.focus());
    };

    worker.onerror = () => {
      if (workerRef.current !== worker) return;
      worker.terminate();
      workerRef.current = null;
      activeRequestIdRef.current = null;
      previewRequestIdRef.current = null;
      setWorkerState("failed");
      setPreviewState(filesRef.current.length > 0 ? "error" : "empty");
      setToolState("error");
      setStatusMessage("");
      setErrorMessage(
        "The image tool could not start. Reload the page, then try again.",
      );
    };
  }, []);

  function selectFiles(nextFiles: File[]) {
    if (nextFiles.length < 1) return;

    if (nextFiles.length > IMAGE_LIMITS.maxBatchFiles) {
      setToolState("error");
      setErrorMessage(`Choose no more than ${IMAGE_LIMITS.maxBatchFiles} images.`);
      return;
    }

    const oversized = nextFiles.find(
      (nextFile) => nextFile.size > IMAGE_LIMITS.maxInputBytes,
    );
    if (oversized) {
      setToolState("error");
      setErrorMessage(`${oversized.name} is larger than 25 MB.`);
      return;
    }

    const totalBytes = nextFiles.reduce((total, nextFile) => total + nextFile.size, 0);
    if (totalBytes > IMAGE_LIMITS.maxBatchInputBytes) {
      setToolState("error");
      setErrorMessage("Choose images totaling no more than 200 MB.");
      return;
    }

    clearResult();
    clearPreview();
    setStatusMessage("");
    filesRef.current = nextFiles;
    setFiles(nextFiles);

    if (workerState === "failed") {
      setPreviewState("error");
      setToolState("error");
      return;
    }

    setErrorMessage("");
    setToolState("ready");

    const firstFile = nextFiles[0]!;
    if (SUPPORTED_IMAGE_MIME_TYPES.includes(firstFile.type as SupportedImageMime)) {
      setOutputMime(firstFile.type as SupportedImageMime);
    }

    if (workerState === "ready") {
      requestPreview(firstFile);
    } else {
      setPreviewState("waiting");
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    selectFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (toolState === "processing") return;
    selectFiles(Array.from(event.dataTransfer.files));
  }

  function buildRequirements(): ImageRequirements {
    const maximumBytes = maximumKilobytes.trim()
      ? Math.round(Number(maximumKilobytes) * 1000)
      : undefined;

    if (
      maximumBytes !== undefined &&
      (!Number.isInteger(maximumBytes) ||
        maximumBytes < IMAGE_LIMITS.minTargetBytes ||
        maximumBytes > IMAGE_LIMITS.maxInputBytes)
    ) {
      throw new Error("File size must be between 1 KB and 25,000 KB, or left blank.");
    }

    const base =
      maximumBytes === undefined ? { outputMime } : { outputMime, maximumBytes };
    const requirementBase =
      "maximumBytes" in base
        ? { outputMime: base.outputMime, maxBytes: base.maximumBytes }
        : { outputMime: base.outputMime };

    if (resizeMode === "keep") {
      return { ...requirementBase, resize: { mode: "keep" } };
    }

    if (resizeMode === "max") {
      return {
        ...requirementBase,
        resize: {
          mode: "max",
          maxWidth: parsePositiveInteger(width, "Maximum width"),
          maxHeight: parsePositiveInteger(height, "Maximum height"),
          allowUpscale,
        },
      };
    }

    const exactWidth = parsePositiveInteger(width, "Width");
    const exactHeight = parsePositiveInteger(height, "Height");
    if (exactWidth * exactHeight > IMAGE_LIMITS.maxOutputPixels) {
      throw new Error("Exact dimensions must be 40 megapixels or less.");
    }

    const exactResize = {
      mode: "exact" as const,
      width: exactWidth,
      height: exactHeight,
      fit,
    };

    if (fit === "contain" || outputMime === "image/jpeg") {
      return {
        ...requirementBase,
        resize: { ...exactResize, backgroundColor },
      };
    }

    return { ...requirementBase, resize: exactResize };
  }

  function cancelProcessing() {
    workerRef.current?.terminate();
    workerRef.current = null;
    activeRequestIdRef.current = null;
    previewRequestIdRef.current = null;
    setWorkerState("starting");
    initializeWorker();
    setToolState(files.length > 0 ? "ready" : "empty");
    setStatusMessage("");
    setErrorMessage("");
  }

  function retryWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
    activeRequestIdRef.current = null;
    previewRequestIdRef.current = null;
    setWorkerState("starting");
    setPreviewState(files.length > 0 && !previewUrl ? "waiting" : previewState);
    setToolState(files.length > 0 ? "ready" : "empty");
    setStatusMessage("");
    setErrorMessage("");
    initializeWorker();
  }

  function processFiles() {
    if (files.length === 0) return;

    clearResult();
    setErrorMessage("");
    setStatusMessage("");

    let requirements: ImageRequirements;
    try {
      requirements = buildRequirements();
    } catch (error) {
      setToolState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Check the rules and try again.",
      );
      return;
    }

    const worker = workerRef.current;
    if (!worker || workerState !== "ready") {
      setToolState("error");
      setErrorMessage("The image tool is still loading. Try again in a moment.");
      return;
    }

    setToolState("processing");
    setStatusMessage(
      files.length === 1 ? "Getting your image ready" : `1 of ${files.length}`,
    );

    const requestId = crypto.randomUUID();
    activeRequestIdRef.current = requestId;

    if (files.length === 1) {
      worker.postMessage({
        type: "process",
        requestId,
        file: files[0]!,
        requirements,
      });
    } else {
      worker.postMessage({ type: "process_batch", requestId, files, requirements });
    }
  }

  useEffect(() => {
    initializeWorker();
    return () => {
      workerRef.current?.terminate();
      activeRequestIdRef.current = null;
      previewRequestIdRef.current = null;
      revokeOutputUrl();
      revokePreviewUrl();
    };
  }, [initializeWorker]);

  useEffect(() => {
    if (workerState === "ready" && previewState === "waiting" && primaryFile) {
      requestPreview(primaryFile);
    }
  }, [previewState, primaryFile, requestPreview, workerState]);

  const canSubmit =
    files.length > 0 &&
    workerState === "ready" &&
    previewState === "ready" &&
    toolState !== "processing";

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] shadow-[0_28px_90px_rgba(27,24,19,0.1)]">
      <form
        className="grid items-stretch lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          processFiles();
        }}
      >
        <section
          aria-labelledby="image-step-heading"
          className="flex flex-col border-b border-[var(--line)] p-5 sm:p-7 lg:border-r lg:border-b-0"
        >
          <h2
            className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
            id="image-step-heading"
          >
            1. Images
          </h2>

          <div
            className={`mt-5 flex min-h-[21rem] flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-dashed p-4 transition-[border-color,background-color] ${
              isDragging
                ? "border-[var(--accent)] bg-[#f7e7de]"
                : "border-[var(--line)] bg-[var(--canvas)]"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsDragging(false);
              }
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            {primaryFile ? (
              <>
                <div className="relative grid h-48 w-full place-items-center overflow-hidden rounded-[1.1rem] bg-[var(--panel)]">
                  {previewUrl && preview ? (
                    <Image
                      alt=""
                      className="object-contain p-3"
                      fill
                      sizes="(min-width: 1024px) 44vw, 90vw"
                      src={previewUrl}
                      unoptimized
                    />
                  ) : (
                    <div className="grid place-items-center gap-3 text-center text-[var(--muted)]">
                      <ImageSquareIcon
                        aria-hidden="true"
                        className={previewState === "loading" ? "animate-pulse" : ""}
                        size={36}
                        weight="regular"
                      />
                      <span className="text-sm">
                        {previewState === "error"
                          ? "Preview unavailable"
                          : "Loading preview…"}
                      </span>
                    </div>
                  )}

                  {files.length > 1 ? (
                    <span className="absolute top-3 right-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--ink)] px-3 font-mono text-[0.68rem] font-semibold text-[var(--panel)]">
                      <ImagesIcon aria-hidden="true" size={15} weight="regular" />
                      {files.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{primaryFile.name}</p>
                    <p className="mt-1 font-mono text-[0.68rem] text-[var(--muted)]">
                      {files.length === 1
                        ? formatCompactBytes(primaryFile.size)
                        : `${files.length} images · ${formatCompactBytes(selectedBytes)}`}
                    </p>
                  </div>
                  <button
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--ink)] px-4 text-xs font-semibold transition-colors hover:bg-[var(--ink)] hover:text-[var(--panel)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    disabled={toolState === "processing"}
                    onClick={() => inputRef.current?.click()}
                    type="button"
                  >
                    Change
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <ImageSquareIcon
                  aria-hidden="true"
                  className="text-[var(--accent)]"
                  size={38}
                  weight="regular"
                />
                <p className="mt-4 text-base font-semibold">Drop images here</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Up to 20 JPEG, PNG, or WebP files
                </p>
                <button
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--ink)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-[var(--panel)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  <UploadSimpleIcon aria-hidden="true" size={18} weight="regular" />
                  Choose images
                </button>
              </div>
            )}

            <input
              ref={inputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={toolState === "processing"}
              multiple
              onChange={handleFileInput}
              type="file"
            />
          </div>
        </section>

        <section
          aria-labelledby="settings-step-heading"
          className="flex flex-col p-5 sm:p-7"
        >
          <h2
            className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
            id="settings-step-heading"
          >
            2. Settings
          </h2>

          <fieldset
            className="mt-5 flex-1 disabled:opacity-60"
            disabled={toolState === "processing"}
          >
            <legend className="sr-only">Image output rules</legend>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-12">
              <label className="text-sm leading-5 font-semibold sm:col-span-4">
                File type
                <select
                  className={fieldClassName()}
                  onChange={(event) => {
                    invalidateResultForRuleChange();
                    setOutputMime(event.target.value as SupportedImageMime);
                  }}
                  value={outputMime}
                >
                  {FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="min-w-0 sm:col-span-8">
                <legend className="text-sm leading-5 font-semibold">Image size</legend>
                <div className="mt-2 grid h-12 grid-cols-3 gap-1 rounded-xl border border-[var(--line)] p-1">
                  {RESIZE_MODE_OPTIONS.map((option) => (
                    <label
                      className={`grid cursor-pointer place-items-center rounded-lg px-2 text-center text-xs font-semibold transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent)] ${
                        resizeMode === option.value
                          ? "bg-[var(--ink)] text-[var(--panel)]"
                          : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                      }`}
                      key={option.value}
                    >
                      <input
                        checked={resizeMode === option.value}
                        className="sr-only"
                        name="resize-mode"
                        onChange={() => {
                          invalidateResultForRuleChange();
                          setResizeMode(option.value);
                        }}
                        type="radio"
                        value={option.value}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="text-sm leading-5 font-semibold sm:col-span-4">
                Max file size
                <span className="ml-1 font-normal text-[var(--muted)]">KB</span>
                <input
                  className={fieldClassName()}
                  inputMode="numeric"
                  max={IMAGE_LIMITS.maxInputBytes / 1000}
                  min="1"
                  onChange={(event) => {
                    invalidateResultForRuleChange();
                    setMaximumKilobytes(event.target.value);
                  }}
                  placeholder="No limit"
                  step="1"
                  type="number"
                  value={maximumKilobytes}
                />
              </label>

              {resizeMode !== "keep" ? (
                <div className="min-w-0 sm:col-span-8">
                  <span className="text-sm leading-5 font-semibold">
                    Dimensions
                    <span className="ml-1 font-normal text-[var(--muted)]">px</span>
                  </span>
                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <input
                      aria-label={resizeMode === "max" ? "Maximum width" : "Width"}
                      className={`${fieldClassName(false)} min-w-0`}
                      inputMode="numeric"
                      max={IMAGE_LIMITS.maxOutputSide}
                      min="1"
                      onChange={(event) => {
                        invalidateResultForRuleChange();
                        setWidth(event.target.value);
                      }}
                      type="number"
                      value={width}
                    />
                    <span aria-hidden="true" className="text-[var(--muted)]">
                      ×
                    </span>
                    <input
                      aria-label={resizeMode === "max" ? "Maximum height" : "Height"}
                      className={`${fieldClassName(false)} min-w-0`}
                      inputMode="numeric"
                      max={IMAGE_LIMITS.maxOutputSide}
                      min="1"
                      onChange={(event) => {
                        invalidateResultForRuleChange();
                        setHeight(event.target.value);
                      }}
                      type="number"
                      value={height}
                    />
                  </div>
                </div>
              ) : null}

              {resizeMode === "exact" ? (
                <div className="grid gap-4 sm:col-span-8 sm:col-start-5 sm:grid-cols-2">
                  <label className="text-sm leading-5 font-semibold">
                    Fit
                    <select
                      className={fieldClassName()}
                      onChange={(event) => {
                        invalidateResultForRuleChange();
                        setFit(event.target.value as "cover" | "contain");
                      }}
                      value={fit}
                    >
                      <option value="cover">Crop to fill</option>
                      <option value="contain">Fit with background</option>
                    </select>
                  </label>

                  {fit === "contain" || outputMime === "image/jpeg" ? (
                    <label className="text-sm leading-5 font-semibold">
                      Background
                      <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-[var(--line)] px-3">
                        <input
                          aria-label="Background color"
                          className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                          onChange={(event) => {
                            invalidateResultForRuleChange();
                            setBackgroundColor(event.target.value);
                          }}
                          type="color"
                          value={backgroundColor}
                        />
                        <span className="font-mono text-xs uppercase text-[var(--muted)]">
                          {backgroundColor}
                        </span>
                      </span>
                    </label>
                  ) : null}
                </div>
              ) : null}

              {resizeMode === "max" ? (
                <label className="flex cursor-pointer items-center gap-3 text-sm sm:col-span-8 sm:col-start-5">
                  <input
                    checked={allowUpscale}
                    className="h-4 w-4 accent-[var(--accent)]"
                    onChange={(event) => {
                      invalidateResultForRuleChange();
                      setAllowUpscale(event.target.checked);
                    }}
                    type="checkbox"
                  />
                  <span className="font-semibold">Enlarge smaller images</span>
                </label>
              ) : null}
            </div>
          </fieldset>

          <p aria-live="polite" className="sr-only">
            {statusMessage || errorMessage}
          </p>

          {workerState === "failed" ||
          toolState === "processing" ||
          (toolState === "error" && errorMessage) ? (
            <div className="mt-5 text-sm">
              {workerState === "failed" ? (
                <button
                  className="h-12 w-full rounded-full border border-[var(--ink)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-[var(--panel)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  onClick={retryWorker}
                  type="button"
                >
                  Try again
                </button>
              ) : toolState === "processing" ? (
                <p className="font-medium text-[var(--accent)]">{statusMessage}…</p>
              ) : null}
              {toolState === "error" && errorMessage ? (
                <p className="rounded-xl bg-[#f2d7cf] px-4 py-3 font-medium text-[#762a1d]">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {toolState === "processing" ? (
              <button
                className="h-12 flex-1 rounded-full border border-[var(--ink)] px-5 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-[var(--panel)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                onClick={cancelProcessing}
                type="button"
              >
                Cancel
              </button>
            ) : (
              <button
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#963522] active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                disabled={!canSubmit}
                type="submit"
              >
                <ResizeIcon aria-hidden="true" size={18} weight="regular" />
                {workerState !== "ready"
                  ? "Getting ready…"
                  : files.length > 1
                    ? `Resize ${files.length} images`
                    : "Resize image"}
              </button>
            )}
          </div>
        </section>
      </form>

      {result && outputUrl ? (
        <section
          aria-labelledby="result-heading"
          aria-live="polite"
          className="border-t border-[var(--line)] bg-[#edf2e4] p-5 outline-none sm:p-7"
          ref={resultRef}
          tabIndex={-1}
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <h2
              className="text-2xl font-semibold tracking-[-0.035em]"
              id="result-heading"
            >
              {result.kind === "single"
                ? "Your image is ready"
                : `${result.data.succeeded} images are ready`}
            </h2>
            <a
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition-[background-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#963522] active:translate-y-px active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              download={result.data.filename}
              href={outputUrl}
            >
              <DownloadSimpleIcon aria-hidden="true" size={18} weight="regular" />
              {result.kind === "single" ? "Download image" : "Download ZIP"}
            </a>
          </div>

          <div className="mt-6 flex items-start gap-4 rounded-[1.3rem] border border-[var(--line)] bg-[var(--panel)] p-5">
            <CheckCircleIcon
              aria-hidden="true"
              className="shrink-0 text-[var(--status-ink)]"
              size={32}
              weight="regular"
            />
            <div className="min-w-0">
              <p className="break-all text-sm font-semibold">{result.data.filename}</p>
              <p className="mt-1 font-mono text-xs leading-5 text-[var(--muted)]">
                {result.kind === "single" ? (
                  <>
                    {
                      FORMAT_OPTIONS.find((option) => option.value === result.data.mime)
                        ?.label
                    }{" "}
                    · {result.data.width} × {result.data.height} px ·{" "}
                    {formatBytes(result.data.bytes)}
                  </>
                ) : (
                  <>
                    {result.data.succeeded} files · {formatBytes(result.data.bytes)}
                    {result.data.failed > 0 ? ` · ${result.data.failed} skipped` : ""}
                  </>
                )}
              </p>
            </div>
          </div>

          {result.kind === "single" ? (
            <details className="mt-4 border-t border-[var(--line)]">
              <summary className="cursor-pointer py-4 text-sm font-semibold">
                View checks
              </summary>
              <div aria-label="Image checks" className="overflow-x-auto" role="region">
                <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Image properties before and after resizing
                  </caption>
                  <thead className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                    <tr className="border-b border-[var(--line)]">
                      <th className="py-3 pr-4 font-semibold">Rule</th>
                      <th className="px-4 py-3 font-semibold">Before</th>
                      <th className="px-4 py-3 font-semibold">Required</th>
                      <th className="py-3 pl-4 font-semibold">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.checks.map((check) => (
                      <tr
                        className="border-b border-[var(--line)] last:border-0"
                        key={check.key}
                      >
                        <th className="py-4 pr-4 font-semibold">{check.label}</th>
                        <td className="px-4 py-4 text-[var(--muted)]">
                          {check.before}
                        </td>
                        <td className="px-4 py-4 text-[var(--muted)]">
                          {check.expected}
                        </td>
                        <td className="py-4 pl-4 font-semibold text-[var(--status-ink)]">
                          Done · {check.after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : (
            <details className="mt-4 border-t border-[var(--line)]">
              <summary className="cursor-pointer py-4 text-sm font-semibold">
                View files
              </summary>
              <ul className="grid gap-2 text-sm">
                {result.data.items.map((item) => (
                  <li
                    className="flex flex-col justify-between gap-1 border-b border-[var(--line)] py-3 last:border-0 sm:flex-row sm:items-center"
                    key={`${item.inputFilename}:${item.outputFilename}`}
                  >
                    <span className="break-all font-semibold">
                      {item.outputFilename}
                    </span>
                    <span className="font-mono text-xs text-[var(--muted)]">
                      {item.width} × {item.height} · {formatBytes(item.bytes)}
                    </span>
                  </li>
                ))}
                {result.data.failures.map((failure) => (
                  <li
                    className="border-b border-[var(--line)] py-3 text-[#762a1d] last:border-0"
                    key={failure.inputFilename}
                  >
                    <span className="font-semibold">{failure.inputFilename}</span>
                    <span className="ml-2">{failure.error.message}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {result.kind === "single" && result.data.warnings.length > 0 ? (
            <ul className="mt-6 grid gap-2 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
              {result.data.warnings.map((warning) => (
                <li key={warning}>Note: {warning}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
