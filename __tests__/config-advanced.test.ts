/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import { loadConfig } from "../src/config";

describe("loadConfig advanced", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("uses default check_name and fail_if_empty", () => {
    delete process.env["INPUT_CHECK_NAME"];
    delete process.env["INPUT_FAIL_IF_EMPTY"];
    const config = loadConfig();
    expect(config.checkName).toBe("TestNG Test Report");
    expect(config.failIfEmpty).toBe(true);
  });

  it("loads custom check_name and fail_if_empty", () => {
    process.env["INPUT_CHECK_NAME"] = "Custom Check";
    process.env["INPUT_FAIL_IF_EMPTY"] = "false";
    const config = loadConfig();
    expect(config.checkName).toBe("Custom Check");
    expect(config.failIfEmpty).toBe(false);
  });

  it("parses fail_if_empty case-insensitively", () => {
    process.env["INPUT_FAIL_IF_EMPTY"] = "FALSE";
    const config = loadConfig();
    expect(config.failIfEmpty).toBe(false);
    process.env["INPUT_FAIL_IF_EMPTY"] = "TrUe";
    expect(loadConfig().failIfEmpty).toBe(true);
  });
});
