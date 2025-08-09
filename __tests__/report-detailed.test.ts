/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import { generateDetailedMarkdown } from "../src/report-detailed";
import { TestNGSuiteResult } from "../src/testng-parser";

describe("generateDetailedMarkdown", () => {
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
    expect(md).toContain("<summary><h3>📦 default (30ms");
    expect(md).toContain("<summary><h4>🔷 A (30ms"); // Class summaries now include indentation
    expect(md).toContain("🔵 <strong>a</strong> (10ms)"); // PASS tests are no longer collapsible, now use HTML strong tags
    expect(md).toContain("<summary><h5>🔴 b (20ms)"); // FAIL tests are still collapsible
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
    expect(md).toContain("Groups: smoke, regression"); // Groups are now inline for PASS tests
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
