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
import {
  generateDetailedMarkdown,
  generateDetailedMarkdownFailedOnly,
} from "./report-detailed";
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
    let summaryContent = "";
    let detailedContent = "";

    if (config.summaryReport) {
      const stats = generateSummaryStats(allSuites);
      summaryContent = generateSummaryMarkdown(stats);
    }

    // Build detailed report content
    if (config.detailedReport) {
      detailedContent = generateDetailedMarkdown(allSuites);
    }

    // Check if the combined output exceeds GitHub's 1024KB limit
    const MAX_SIZE_BYTES = 1024 * 1024; // 1024KB
    let combinedContent = summaryContent + detailedContent;
    const contentSizeBytes = Buffer.byteLength(combinedContent, "utf8");

    if (contentSizeBytes > MAX_SIZE_BYTES && config.detailedReport) {
      core.info(
        `Report size (${contentSizeBytes} bytes) exceeds GitHub limit (${MAX_SIZE_BYTES} bytes). Truncating detailed report to show only failed tests.`,
      );
      // Regenerate detailed report with only failed tests
      detailedContent = generateDetailedMarkdownFailedOnly(allSuites);
      combinedContent = summaryContent + detailedContent;

      const newSizeBytes = Buffer.byteLength(combinedContent, "utf8");
      core.info(`Truncated report size: ${newSizeBytes} bytes`);

      if (newSizeBytes > MAX_SIZE_BYTES) {
        core.warning(
          `Even after truncation, report size (${newSizeBytes} bytes) still exceeds GitHub limit. Some content may be cut off.`,
        );
      }
    }

    // Add content to summary
    if (summaryContent) {
      core.summary.addRaw(summaryContent);
    }
    if (detailedContent) {
      core.summary.addRaw(detailedContent);
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
