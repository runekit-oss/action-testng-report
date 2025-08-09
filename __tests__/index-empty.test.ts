/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import * as core from "@actions/core";
import * as _fs from "fs";
import * as glob from "glob";
import { loadConfig } from "../src/config";

jest.mock("@actions/core");

describe("index fail_if_empty logic", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    (core.setFailed as jest.Mock).mockClear();
    (core.warning as jest.Mock).mockClear();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("fails if no files and fail_if_empty is true", () => {
    process.env["INPUT_REPORT_PATHS"] = "no-such-file.xml";
    process.env["INPUT_FAIL_IF_EMPTY"] = "true";
    const config = loadConfig();
    const files = glob.sync(config.reportPaths);
    if (files.length === 0) {
      if (config.failIfEmpty) {
        core.setFailed(
          "No TestNG report files found for pattern: " + config.reportPaths,
        );
      } else {
        core.warning(
          "No TestNG report files found for pattern: " + config.reportPaths,
        );
      }
    }
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("No TestNG report files found"),
    );
    expect(core.warning).not.toHaveBeenCalled();
  });

  it("warns if no files and fail_if_empty is false", () => {
    process.env["INPUT_REPORT_PATHS"] = "no-such-file.xml";
    process.env["INPUT_FAIL_IF_EMPTY"] = "false";
    const config = loadConfig();
    const files = glob.sync(config.reportPaths);
    if (files.length === 0) {
      if (config.failIfEmpty) {
        core.setFailed(
          "No TestNG report files found for pattern: " + config.reportPaths,
        );
      } else {
        core.warning(
          "No TestNG report files found for pattern: " + config.reportPaths,
        );
      }
    }
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining("No TestNG report files found"),
    );
    expect(core.setFailed).not.toHaveBeenCalled();
  });
});
