/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
// GitHub Annotations Generator for TestNG failed tests

import * as core from "@actions/core";
import { TestNGSuiteResult } from "./testng-parser";

export function createAnnotationsForFailedTests(
  suites: TestNGSuiteResult[],
  // options parameter removed as it's unused
) {
  for (const suite of suites) {
    for (const test of suite.testCases) {
      if (test.status === "FAIL") {
        const message = `Test failed: ${test.className}.${test.name}\n${test.failureMessage || ""}`;
        const annotationProps: Record<string, unknown> = {
          title: `Test Failure: ${test.className}.${test.name}`,
          file: undefined, // Could be mapped if source info is available
          startLine: 1,
          endLine: 1,
          annotationLevel: "failure",
          message:
            message +
            (test.stackTrace ? `\nStacktrace\n${test.stackTrace}\n` : ""),
        };
        // Use core.error to create a GitHub annotation
        core.error(annotationProps.message as string, annotationProps);
      }
    }
  }
}
