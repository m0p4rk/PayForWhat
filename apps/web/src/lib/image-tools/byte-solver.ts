/*
 * SPDX-FileCopyrightText: 2026 m0p4rk
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface SizedValue {
  size: number;
}

export interface QualityCandidate<T extends SizedValue> {
  value: T;
  quality: number;
}

export interface QualitySearchResult<T extends SizedValue> {
  match: QualityCandidate<T> | null;
  smallest: QualityCandidate<T>;
  attempts: number;
}

export async function findBestQuality<T extends SizedValue>(
  encode: (quality: number) => Promise<T>,
  maximumBytes: number,
  options: { minimum?: number; maximum?: number; iterations?: number } = {},
): Promise<QualitySearchResult<T>> {
  const minimum = options.minimum ?? 0.05;
  const maximum = options.maximum ?? 0.92;
  const iterations = options.iterations ?? 8;
  let attempts = 0;
  let bestMatch: QualityCandidate<T> | null = null;
  let smallest: QualityCandidate<T> | null = null;

  async function evaluate(quality: number) {
    const candidate = { value: await encode(quality), quality };
    attempts += 1;
    if (!smallest || candidate.value.size < smallest.value.size) {
      smallest = candidate;
    }
    if (
      candidate.value.size <= maximumBytes &&
      (!bestMatch || candidate.quality > bestMatch.quality)
    ) {
      bestMatch = candidate;
    }
    return candidate;
  }

  const highest = await evaluate(maximum);
  if (highest.value.size <= maximumBytes) {
    return { match: highest, smallest: highest, attempts };
  }

  const lowest = await evaluate(minimum);
  if (lowest.value.size > maximumBytes) {
    return { match: null, smallest: lowest, attempts };
  }

  let lowerBound = minimum;
  let upperBound = maximum;

  for (let index = 0; index < iterations; index += 1) {
    const quality = (lowerBound + upperBound) / 2;
    const candidate = await evaluate(quality);

    if (candidate.value.size <= maximumBytes) {
      lowerBound = quality;
    } else {
      upperBound = quality;
    }
  }

  return {
    match: bestMatch,
    smallest: smallest!,
    attempts,
  };
}
