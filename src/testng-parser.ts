/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
// XML result parser for parsing TestNG result files

import { XMLParser } from "fast-xml-parser";

export interface TestNGTestCase {
  name: string;
  className: string;
  durationMs: number;
  status: "PASS" | "FAIL" | "SKIP";
  failureMessage?: string;
  stackTrace?: string;
  groups?: string[];
  expected?: string;
  actual?: string;
}

export interface TestNGSuiteResult {
  suiteName: string;
  durationMs: number;
  testCases: TestNGTestCase[];
}

export function parseTestNGResult(xml: string): TestNGSuiteResult[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  const json = parser.parse(xml);

  // Defensive check: ensure testng-results exists
  if (!json["testng-results"] || !json["testng-results"].suite) {
    return [];
  }

  const suites = Array.isArray(json["testng-results"]?.suite)
    ? json["testng-results"].suite
    : [json["testng-results"].suite];

  return suites
    .filter(
      (suite: Record<string, unknown>) => suite && typeof suite === "object",
    ) // Filter out undefined/null suites
    .map((suite: Record<string, unknown>) => {
      const suiteName = (suite["@_name"] as string) || "Unnamed Suite";
      const durationMs = Number((suite["@_duration-ms"] as string) || 0);
      const testCases: TestNGTestCase[] = [];

      // Defensive check: ensure suite.test exists
      if (!suite.test) {
        return { suiteName, durationMs, testCases };
      }

      const tests = Array.isArray(suite.test) ? suite.test : [suite.test];
      tests.forEach((test: Record<string, unknown>) => {
        // Defensive check: ensure test exists and has class property
        if (!test || !test.class) return;

        const classes = Array.isArray(test.class) ? test.class : [test.class];
        classes.forEach((clazz: Record<string, unknown>) => {
          // Defensive check: ensure clazz exists
          if (!clazz) return;

          const className = (clazz["@_name"] as string) || "UnnamedClass";
          const methods = Array.isArray(clazz["test-method"])
            ? clazz["test-method"]
            : [clazz["test-method"]];
          methods.forEach((method: Record<string, unknown>) => {
            if (!method) return;
            const status = ((method["@_status"] as string) || "").toUpperCase();
            if (!["PASS", "FAIL", "SKIP"].includes(status)) return;
            const testCase: TestNGTestCase = {
              name: (method["@_name"] as string) || "UnnamedTest",
              className,
              durationMs: Number((method["@_duration-ms"] as string) || 0),
              status: status as "PASS" | "FAIL" | "SKIP",
            };
            if (status === "FAIL" && method["exception"]) {
              const exception = method["exception"] as Record<string, unknown>;
              testCase.failureMessage = (exception["message"] as string) || "";
              testCase.stackTrace =
                (exception["full-stacktrace"] as string) || "";
              if (typeof exception["expected"] === "string") {
                testCase.expected = exception["expected"] as string;
              }
              if (typeof exception["actual"] === "string") {
                testCase.actual = exception["actual"] as string;
              }
            }
            if (method["@_groups"]) {
              testCase.groups = ((method["@_groups"] as string) || "").split(
                ",",
              );
            }
            testCases.push(testCase);
          });
        });
      });
      return {
        suiteName,
        durationMs,
        testCases,
      };
    });
}
