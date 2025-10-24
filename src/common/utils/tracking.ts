// utils/tracking.ts
export function generateTrackingId(prefix = "TRK"): string {
  const timestamp = Date.now().toString(36).toUpperCase(); // encode current time
  const random = Math.floor(Math.random() * 1_000_000)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0"); // random 4-char code
  return `${prefix}${timestamp}${random}`;
}
