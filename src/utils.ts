// Shared utilities for TestNG reports
// Copyright 2025 Anoop Garlapati and RuneKit Contributors
// Licensed under the Apache License, Version 2.0

/**
 * Format milliseconds as HH:mm:ss:SSS
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    ":" +
    String(millis).padStart(3, "0")
  );
}
