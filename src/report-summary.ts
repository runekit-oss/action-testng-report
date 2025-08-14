/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
// Summary Report Generator for TestNG results

import { TestNGSuiteResult } from "./testng-parser";
import { formatDuration } from "./utils";

export interface PackageStats {
  packageName: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
}

export interface SummaryStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  packageStats: PackageStats[];
}

function generatePackageStats(suites: TestNGSuiteResult[]): PackageStats[] {
  const packageMap = new Map<string, PackageStats>();

  for (const suite of suites) {
    for (const test of suite.testCases) {
      const packageName =
        test.className.substring(0, test.className.lastIndexOf(".")) ||
        "default";

      if (!packageMap.has(packageName)) {
        packageMap.set(packageName, {
          packageName,
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          durationMs: 0,
        });
      }

      const packageStats = packageMap.get(packageName)!;
      packageStats.total++;
      packageStats.durationMs += test.durationMs;

      if (test.status === "PASS") packageStats.passed++;
      else if (test.status === "FAIL") packageStats.failed++;
      else if (test.status === "SKIP") packageStats.skipped++;
    }
  }

  return Array.from(packageMap.values()).sort((a, b) =>
    a.packageName.localeCompare(b.packageName),
  );
}

export function generateSummaryStats(
  suites: TestNGSuiteResult[],
): SummaryStats {
  let total = 0,
    passed = 0,
    failed = 0,
    skipped = 0,
    durationMs = 0;
  for (const suite of suites) {
    durationMs += suite.durationMs;
    for (const test of suite.testCases) {
      total++;
      if (test.status === "PASS") passed++;
      else if (test.status === "FAIL") failed++;
      else if (test.status === "SKIP") skipped++;
    }
  }

  const packageStats = generatePackageStats(suites);

  return { total, passed, failed, skipped, durationMs, packageStats };
}

export function generateSummaryMarkdown(stats: SummaryStats): string {
  let markdown =
    `## TestNG Summary\n\n` +
    `**Total:** ${stats.total}  |  **Passed:** ${stats.passed}  |  **Failed:** ${stats.failed}  |  **Skipped:** ${stats.skipped}  |  **Duration:** ${stats.durationMs} ms\n\n`;

  if (stats.packageStats.length > 0) {
    markdown += `### Package Statistics\n\n`;
    markdown += `| **Package** | **Duration** | **Fail** | **Skip** | **Pass** | **Total** |\n`;
    markdown += `|-------------|--------------|----------|----------|----------|----------|\n`;

    for (const pkg of stats.packageStats) {
      const duration = formatDuration(pkg.durationMs);
      markdown += `| ${pkg.packageName} | ${duration} | ${pkg.failed} | ${pkg.skipped} | ${pkg.passed} | ${pkg.total} |\n`;
    }
    markdown += `\n`;
  }

  return markdown;
}
