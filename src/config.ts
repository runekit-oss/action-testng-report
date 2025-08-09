/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
// Configuration Manager for TestNG Report Action

export interface ActionConfig {
  reportPaths: string;
  summaryReport: boolean;
  detailedReport: boolean;
  checkName: string;
  failIfEmpty: boolean;
}

export function loadConfig(): ActionConfig {
  const reportPaths =
    process.env["INPUT_REPORT_PATHS"] || "**/testng-results.xml";
  const summaryReport =
    (process.env["INPUT_SUMMARY_REPORT"] || "true").toLowerCase() === "true";
  const detailedReport =
    (process.env["INPUT_DETAILED_REPORT"] || "false").toLowerCase() === "true";
  const checkName = process.env["INPUT_CHECK_NAME"] || "TestNG Test Report";
  const failIfEmpty =
    (process.env["INPUT_FAIL_IF_EMPTY"] || "true").toLowerCase() === "true";
  return { reportPaths, summaryReport, detailedReport, checkName, failIfEmpty };
}
