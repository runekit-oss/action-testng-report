/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
import * as fs from "fs";
import * as path from "path";
import { parseTestNGResult } from "../src/testng-parser";
import * as glob from "glob";

describe("Glob and multi-file TestNG report handling", () => {
  const tmpDir = path.join(__dirname, "tmp-reports");
  const report1 = path.join(tmpDir, "a", "testng-results.xml");
  const report2 = path.join(tmpDir, "b", "testng-results.xml");
  const xml1 = `<?xml version=\"1.0\"?><testng-results><suite name=\"A\" duration-ms=\"10\"><test name=\"T\"><class name=\"C\"><test-method name=\"m1\" status=\"PASS\" duration-ms=\"5\"/></class></test></suite></testng-results>`;
  const xml2 = `<?xml version=\"1.0\"?><testng-results><suite name=\"B\" duration-ms=\"20\"><test name=\"T\"><class name=\"D\"><test-method name=\"m2\" status=\"FAIL\" duration-ms=\"10\"><exception><message>fail</message><full-stacktrace>trace</full-stacktrace></exception></test-method></class></test></suite></testng-results>`;

  beforeAll(() => {
    fs.mkdirSync(path.join(tmpDir, "a"), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, "b"), { recursive: true });
    fs.writeFileSync(report1, xml1);
    fs.writeFileSync(report2, xml2);
  });
  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("finds all matching files with glob", () => {
    const files = glob.sync(path.join(tmpDir, "**/testng-results.xml"));
    expect(files.sort()).toEqual([report1, report2].sort());
  });

  it("parses and merges results from multiple files", () => {
    const files = glob.sync(path.join(tmpDir, "**/testng-results.xml"));
    let allSuites: ReturnType<typeof parseTestNGResult> = [];
    for (const file of files) {
      const xml = fs.readFileSync(file, "utf-8");
      const suites = parseTestNGResult(xml);
      allSuites = allSuites.concat(suites);
    }
    expect(allSuites).toHaveLength(2);
    const suiteNames = allSuites.map((s) => s.suiteName).sort();
    expect(suiteNames).toEqual(["A", "B"]);
    const passSuite = allSuites.find((s) => s.suiteName === "A");
    const failSuite = allSuites.find((s) => s.suiteName === "B");
    expect(passSuite?.testCases[0].status).toBe("PASS");
    expect(failSuite?.testCases[0].status).toBe("FAIL");
    expect(failSuite?.testCases[0].failureMessage).toBe("fail");
    expect(failSuite?.testCases[0].stackTrace).toBe("trace");
  });

  it("handles no matches gracefully", () => {
    const files = glob.sync(path.join(tmpDir, "**/no-such-file.xml"));
    expect(files).toHaveLength(0);
  });
});
