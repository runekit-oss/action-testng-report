/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
// Detailed Report Generator for TestNG results

import { TestNGSuiteResult, TestNGTestCase } from "./testng-parser";

interface PackageGroup {
  packageName: string;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  classes: Map<string, ClassGroup>;
}

interface ClassGroup {
  className: string;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  tests: TestNGTestCase[];
}

function groupTestsByPackageAndClass(
  suites: TestNGSuiteResult[],
): Map<string, PackageGroup> {
  const packageMap = new Map<string, PackageGroup>();

  for (const suite of suites) {
    for (const test of suite.testCases) {
      const packageName =
        test.className.substring(0, test.className.lastIndexOf(".")) ||
        "default";
      const simpleClassName = test.className.substring(
        test.className.lastIndexOf(".") + 1,
      );

      if (!packageMap.has(packageName)) {
        packageMap.set(packageName, {
          packageName,
          passed: 0,
          failed: 0,
          skipped: 0,
          durationMs: 0,
          classes: new Map<string, ClassGroup>(),
        });
      }

      const packageGroup = packageMap.get(packageName)!;

      if (!packageGroup.classes.has(simpleClassName)) {
        packageGroup.classes.set(simpleClassName, {
          className: simpleClassName,
          passed: 0,
          failed: 0,
          skipped: 0,
          durationMs: 0,
          tests: [],
        });
      }

      const classGroup = packageGroup.classes.get(simpleClassName)!;
      classGroup.tests.push(test);

      // Update counts and durations
      packageGroup.durationMs += test.durationMs;
      classGroup.durationMs += test.durationMs;

      if (test.status === "PASS") {
        packageGroup.passed++;
        classGroup.passed++;
      } else if (test.status === "FAIL") {
        packageGroup.failed++;
        classGroup.failed++;
      } else if (test.status === "SKIP") {
        packageGroup.skipped++;
        classGroup.skipped++;
      }
    }
  }

  return packageMap;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "PASS":
      return "blue";
    case "FAIL":
      return "red";
    case "SKIP":
      return "grey";
    default:
      return "black";
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case "PASS":
      return "🔵"; // Blue circle
    case "FAIL":
      return "🔴"; // Red circle
    case "SKIP":
      return "🟡"; // Yellow circle
    default:
      return "🟡"; // Default yellow circle
  }
}

export function generateDetailedMarkdown(suites: TestNGSuiteResult[]): string {
  let md = `## Detailed TestNG Report\n\n`;

  const packageGroups = groupTestsByPackageAndClass(suites);

  // Sort packages alphabetically
  const sortedPackages = Array.from(packageGroups.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  for (const [packageName, packageGroup] of sortedPackages) {
    md += `<details>\n<summary><h3>📦 ${packageName} (${packageGroup.durationMs}ms - ${packageGroup.failed} failed, ${packageGroup.skipped} skipped, ${packageGroup.passed} passed)</h3></summary>\n\n`;

    // Sort classes alphabetically
    const sortedClasses = Array.from(packageGroup.classes.entries()).sort(
      (a, b) => a[0].localeCompare(b[0]),
    );

    for (const [className, classGroup] of sortedClasses) {
      md += `<details>\n<summary><h4>🔷 ${className} (${classGroup.durationMs}ms - ${classGroup.failed} failed, ${classGroup.skipped} skipped, ${classGroup.passed} passed)</h4></summary>\n\n`;

      // Sort tests alphabetically
      const sortedTests = classGroup.tests.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      for (const test of sortedTests) {
        const statusColor = getStatusColor(test.status);
        const statusEmoji = getStatusEmoji(test.status);

        // Only use collapsible sections for failed tests
        if (test.status === "FAIL") {
          md += `<details>\n<summary><h5>${statusEmoji} ${test.name} (${test.durationMs}ms) - <span style="color:${statusColor}; font-weight:bold;">${test.status}</span></h5></summary>\n\n`;

          if (test.failureMessage) {
            md += `**Message:**\n\n\`\`\`\n${test.failureMessage}\n\`\`\`\n\n`;
          }

          if (test.expected !== undefined || test.actual !== undefined) {
            if (test.expected !== undefined) {
              md += `**Expected:**\n\n\`\`\`\n${test.expected}\n\`\`\`\n\n`;
            }
            if (test.actual !== undefined) {
              md += `**Actual:**\n\n\`\`\`\n${test.actual}\n\`\`\`\n\n`;
            }
          }

          if (test.stackTrace) {
            md += `**Stack Trace:**\n\n\`\`\`java\n${test.stackTrace}\n\`\`\`\n\n`;
          }

          if (test.groups && test.groups.length > 0) {
            md += `**Groups:** ${test.groups.join(", ")}\n\n`;
          }

          md += `</details>\n`;
        } else {
          // For PASS and SKIP tests, just show a simple line without collapsible section
          md += `${statusEmoji} <strong>${test.name}</strong> (${test.durationMs}ms) - <span style="color:${statusColor}; font-weight:bold;">${test.status}</span>`;

          if (test.groups && test.groups.length > 0) {
            md += ` - Groups: ${test.groups.join(", ")}`;
          }

          md += `\n\n`;
        }
      }

      md += `</details>\n\n`;
    }

    md += `</details>\n\n`;
  }

  return md;
}
