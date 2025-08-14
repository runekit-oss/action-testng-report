/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import * as core from "@actions/core";
import { loadConfig } from "./config";
import { parseTestNGResult } from "./testng-parser";
import { createAnnotationsForFailedTests } from "./annotations";
import {
  generateSummaryStats,
  generateSummaryMarkdown,
} from "./report-summary";
import { generateDetailedMarkdown } from "./report-detailed";
import * as fs from "fs";
import * as glob from "glob";

async function run() {
  try {
    const config = loadConfig();
    const files = glob.sync(config.reportPaths);
    if (files.length === 0) {
      const msg = `No TestNG report files found for pattern: ${config.reportPaths}`;
      if (config.failIfEmpty) {
        core.setFailed(msg);
      } else {
        core.warning(msg);
      }
      return;
    }
    let allSuites: ReturnType<typeof parseTestNGResult> = [];
    for (const file of files) {
      const xml = fs.readFileSync(file, "utf-8");
      const suites = parseTestNGResult(xml);
      allSuites = allSuites.concat(suites);
    }
    // Optionally use check_name for future check run integration (placeholder)
    core.info(`Check name: ${config.checkName}`);
    createAnnotationsForFailedTests(allSuites);

    // Build summary content
    if (config.summaryReport) {
      const stats = generateSummaryStats(allSuites);
      const summary = generateSummaryMarkdown(stats);
      core.summary.addRaw(summary);
    }
    // Build detailed report content
    if (config.detailedReport) {
      const detailed = generateDetailedMarkdown(allSuites);
      core.summary.addRaw(detailed);
    }

    // Write summary only once at the end
    if (config.summaryReport || config.detailedReport) {
      await core.summary.write();
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      core.setFailed((error as { message?: string }).message || String(error));
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
