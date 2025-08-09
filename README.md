
# TestNG Report Generator GitHub Action

[![CI](https://github.com/runekit-oss/action-testng-report/actions/workflows/ci.yml/badge.svg)](https://github.com/runekit-oss/action-testng-report/actions/workflows/ci.yml)

A GitHub Action to parse TestNG XML result files, generate Markdown test reports, and annotate failed tests directly in pull requests.

---

## Features

- Parses TestNG XML result files (supports multiple suites and edge cases)
- Generates GitHub workflow annotations for failed tests (with stack traces)
- Provides summary and detailed Markdown test reports in workflow summary
- Highlights slowest tests
- Highly configurable via action inputs
- Fast, robust, and CI-friendly

---

## Quick Start

Add the following to your workflow (see `.github/workflows/example.yml`):

```yaml
jobs:
  testng-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run TestNG Report Action
        uses: runekit-oss/action-testng-report@main
        with:
          report_paths: '**/testng-results.xml'
```

---

## Inputs

| Name            | Description                                         | Default                     |
|-----------------|-----------------------------------------------------|-----------------------------|
| report_paths    | Glob for TestNG XML files                           | `**/testng-results.xml`     |
| summary_report  | Generate summary report (true/false)                | `true`                      |
| detailed_report | Generate detailed report (true/false)               | `false`                     |
| check_name      | Check run name (for future integration)             | `TestNG Test Report`        |
| fail_if_empty   | Fail if no test results found (true/false)          | `true`                      |

---

## Example Output

**Summary Report (Markdown):**

```
## TestNG Summary

**Total:** 42  |  **Passed:** 40  |  **Failed:** 2  |  **Skipped:** 0  |  **Duration:** 1234 ms

**Slowest Tests:**
- com.example.FooTest.shouldFail: 500 ms
- com.example.BarTest.shouldFail: 400 ms
```

**Annotations:**
- Failed tests are annotated in the GitHub Actions UI with error messages and stack traces.

---

## Troubleshooting

- Ensure your TestNG XML files are generated and available at the specified `report_paths`.
- If no files are found, the action will fail if `fail_if_empty` is `true`.
- For custom locations, update the `report_paths` input.
- For more verbose output, enable debug logging in your workflow run.

---
