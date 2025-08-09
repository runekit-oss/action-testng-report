/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import * as core from "@actions/core";
import { createAnnotationsForFailedTests } from "../src/annotations";
import { TestNGSuiteResult } from "../src/testng-parser";

jest.mock("@actions/core");

describe("createAnnotationsForFailedTests", () => {
  it("does not create annotation for non-FAIL status", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "SuiteSkip",
        durationMs: 100,
        testCases: [
          { name: "skip", className: "A", durationMs: 1, status: "SKIP" },
        ],
      },
    ];
    createAnnotationsForFailedTests(suites);
    expect(core.error).not.toHaveBeenCalled();
  });

  it("creates annotation for failed test with no failureMessage or stackTrace", () => {
    createAnnotationsForFailedTests([
      {
        suiteName: "Suite3",
        durationMs: 100,
        testCases: [
          {
            name: "testFail3",
            className: "C",
            durationMs: 10,
            status: "FAIL",
          },
        ],
      },
    ]);
    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining("Test failed: C.testFail3"),
      expect.objectContaining({ annotationLevel: "failure" }),
    );
  });

  it("creates annotation for failed test with stack trace", () => {
    createAnnotationsForFailedTests([
      {
        suiteName: "Suite1",
        durationMs: 100,
        testCases: [
          {
            name: "testFail",
            className: "A",
            durationMs: 10,
            status: "FAIL",
            failureMessage: "fail msg",
            stackTrace: "trace info",
          },
        ],
      },
    ]);
    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining("trace info"),
      expect.objectContaining({ annotationLevel: "failure" }),
    );
  });

  it("creates annotation for failed test without stack trace", () => {
    createAnnotationsForFailedTests([
      {
        suiteName: "Suite2",
        durationMs: 100,
        testCases: [
          {
            name: "testFail2",
            className: "B",
            durationMs: 10,
            status: "FAIL",
            failureMessage: "fail msg 2",
          },
        ],
      },
    ]);
    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining("fail msg 2"),
      expect.objectContaining({ annotationLevel: "failure" }),
    );
  });

  it("creates annotations for failed tests", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "Suite1",
        durationMs: 1000,
        testCases: [
          { name: "pass", className: "A", durationMs: 1, status: "PASS" },
          {
            name: "fail",
            className: "A",
            durationMs: 2,
            status: "FAIL",
            failureMessage: "Oops",
            stackTrace: "trace",
          },
        ],
      },
    ];
    createAnnotationsForFailedTests(suites);
    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining("Test failed: A.fail"),
      expect.objectContaining({ annotationLevel: "failure" }),
    );
  });

  it("does not create annotations for skipped tests", () => {
    const suites: TestNGSuiteResult[] = [
      {
        suiteName: "Suite2",
        durationMs: 500,
        testCases: [
          { name: "skip", className: "B", durationMs: 3, status: "SKIP" },
        ],
      },
    ];
    (core.error as jest.Mock).mockClear();
    createAnnotationsForFailedTests(suites);
    expect(core.error).not.toHaveBeenCalled();
  });
});
