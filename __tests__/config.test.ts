/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import { loadConfig } from "../src/config";

describe("loadConfig", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("loads defaults", () => {
    delete process.env["INPUT_REPORT_PATHS"];
    delete process.env["INPUT_SUMMARY_REPORT"];
    delete process.env["INPUT_DETAILED_REPORT"];
    const config = loadConfig();
    expect(config.reportPaths).toBe("**/testng-results.xml");
    expect(config.summaryReport).toBe(true);
    expect(config.detailedReport).toBe(false);
  });

  it("loads from env", () => {
    process.env["INPUT_REPORT_PATHS"] = "foo.xml";
    process.env["INPUT_SUMMARY_REPORT"] = "false";
    process.env["INPUT_DETAILED_REPORT"] = "true";
    jest.resetModules();
    const { loadConfig } = require("../src/config");
    const config = loadConfig();
    expect(config.reportPaths).toBe("foo.xml");
    expect(config.summaryReport).toBe(false);
    expect(config.detailedReport).toBe(true);
  });
});
