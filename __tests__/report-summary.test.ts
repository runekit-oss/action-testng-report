/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import {
  generateSummaryStats,
  generateSummaryMarkdown,
} from "../src/report-summary";
import { TestNGSuiteResult } from "../src/testng-parser";

describe("generateSummaryStats", () => {
  it("computes stats", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "S",
        durationMs: 100,
        testCases: [
          { name: "a", className: "A", durationMs: 10, status: "PASS" },
          { name: "b", className: "A", durationMs: 30, status: "FAIL" },
          { name: "c", className: "A", durationMs: 60, status: "SKIP" },
        ],
      },
    ];
    const stats = generateSummaryStats(suites);
    expect(stats.total).toBe(3);
    expect(stats.passed).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.skipped).toBe(1);
    expect(stats.durationMs).toBe(100);
  });
});

describe("generateSummaryMarkdown", () => {
  it("renders markdown summary", () => {
    const stats = {
      total: 3,
      passed: 1,
      failed: 1,
      skipped: 1,
      durationMs: 100,
      packageStats: [],
    };
    const md = generateSummaryMarkdown(stats);
    expect(md).toContain("**Total:** 3");
    expect(md).toContain("**Passed:** 1");
    expect(md).toContain("**Failed:** 1");
    expect(md).toContain("**Skipped:** 1");
    expect(md).not.toContain("Slowest Tests");
  });

  it("renders package statistics table", () => {
    const stats = {
      total: 3,
      passed: 1,
      failed: 1,
      skipped: 1,
      durationMs: 100,
      packageStats: [
        {
          packageName: "com.example.test",
          total: 2,
          passed: 1,
          failed: 1,
          skipped: 0,
          durationMs: 5000,
        },
        {
          packageName: "com.example.util",
          total: 1,
          passed: 0,
          failed: 0,
          skipped: 1,
          durationMs: 1000,
        },
      ],
    };
    const md = generateSummaryMarkdown(stats);
    expect(md).toContain("### Package Statistics");
    expect(md).toContain(
      "| **Package** | **Duration** | **Fail** | **Skip** | **Pass** | **Total** |",
    );
    expect(md).toContain("| com.example.test | 00:00:05:000 | 1 | 0 | 1 | 2 |");
    expect(md).toContain("| com.example.util | 00:00:01:000 | 0 | 1 | 0 | 1 |");
  });
});
