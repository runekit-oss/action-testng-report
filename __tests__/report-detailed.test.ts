/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import { generateDetailedMarkdown } from "../src/report-detailed";
import { TestNGSuiteResult } from "../src/testng-parser";

describe("generateDetailedMarkdown", () => {
  it("sorts packages by most failed tests first, then alphabetically", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "s1",
        durationMs: 100,
        testCases: [
          { name: "a", className: "pkg1.A", durationMs: 10, status: "FAIL" },
          { name: "b", className: "pkg2.B", durationMs: 10, status: "FAIL" },
          { name: "c", className: "pkg2.B", durationMs: 10, status: "FAIL" },
          { name: "d", className: "pkg3.C", durationMs: 10, status: "PASS" },
        ],
      },
    ];
    const md = generateDetailedMarkdown(suites);
    // pkg2 has 2 fails, pkg1 has 1 fail, pkg3 has 0 fails
    const pkg2Idx = md.indexOf("📦 pkg2");
    const pkg1Idx = md.indexOf("📦 pkg1");
    const pkg3Idx = md.indexOf("📦 pkg3");
    expect(pkg2Idx).toBeLessThan(pkg1Idx);
    expect(pkg1Idx).toBeLessThan(pkg3Idx);
  });

  it("sorts classes within a package by most failed tests first, then alphabetically", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "s1",
        durationMs: 100,
        testCases: [
          { name: "a", className: "pkg.A", durationMs: 10, status: "FAIL" },
          { name: "b", className: "pkg.B", durationMs: 10, status: "FAIL" },
          { name: "c", className: "pkg.B", durationMs: 10, status: "FAIL" },
          { name: "d", className: "pkg.C", durationMs: 10, status: "PASS" },
        ],
      },
    ];
    const md = generateDetailedMarkdown(suites);
    // B has 2 fails, A has 1 fail, C has 0 fails
    const bIdx = md.indexOf("📄 B");
    const aIdx = md.indexOf("📄 A");
    const cIdx = md.indexOf("📄 C");
    expect(bIdx).toBeLessThan(aIdx);
    expect(aIdx).toBeLessThan(cIdx);
  });
  it("renders detailed markdown for suites and tests", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "Suite1",
        durationMs: 100,
        testCases: [
          { name: "a", className: "A", durationMs: 10, status: "PASS" },
          {
            name: "b",
            className: "A",
            durationMs: 20,
            status: "FAIL",
            failureMessage: "fail",
            stackTrace: "trace",
          },
        ],
      },
    ];
    const md = generateDetailedMarkdown(suites);
    expect(md).toContain("<details>");
    expect(md).toContain("<summary><h3>📦 default (00:00:00:030");
    expect(md).toContain("<summary><h4>📄 A (00:00:00:030"); // Class summaries include indentation
    expect(md).toContain("🔵 <strong>a</strong> (00:00:00:010)"); // PASS tests are not collapsible
    expect(md).toContain("<summary><h5>🔴 b (00:00:00:020)"); // FAIL tests are still collapsible
    expect(md).toContain(
      '<span style="color:blue; font-weight:bold;">PASS</span>',
    );
    expect(md).toContain(
      '<span style="color:red; font-weight:bold;">FAIL</span>',
    );
    expect(md).toContain("fail");
    expect(md).toContain("trace");
    expect(md).toContain("</details>");
  });

  it("includes groups if present", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "SuiteWithGroups",
        durationMs: 100,
        testCases: [
          {
            name: "testWithGroups",
            className: "TestClass",
            durationMs: 50,
            status: "PASS",
            groups: ["smoke", "regression"],
          },
        ],
      },
    ];
    const md = generateDetailedMarkdown(suites);
    expect(md).toContain("Groups: smoke, regression"); // Groups are inline for PASS tests
  });

  it("omits groups if not present or empty", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "SuiteWithoutGroups",
        durationMs: 100,
        testCases: [
          {
            name: "testWithoutGroups",
            className: "TestClass",
            durationMs: 50,
            status: "PASS",
          },
        ],
      },
    ];
    const md = generateDetailedMarkdown(suites);
    expect(md).not.toContain("**Groups:**");
  });

  it("formats stackTrace with newlines", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "SuiteWithStackTrace",
        durationMs: 100,
        testCases: [
          {
            name: "failedTest",
            className: "TestClass",
            durationMs: 50,
            status: "FAIL",
            stackTrace: "line1\nline2\nline3",
          },
        ],
      },
    ];
    const md = generateDetailedMarkdown(suites);
    expect(md).toContain("line1\nline2\nline3");
  });
});
