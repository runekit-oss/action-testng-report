/**
 * Copyright 2025 Anoop Garlapati and RuneKit Contributors
 * Licensed under the Apache License, Version 2.0 – see LICENSE in the root of this repository.
 */
// Unit tests for TestNG XML parser

import { parseTestNGResult } from "../src/testng-parser";

const minimalXml = `<?xml version="1.0" encoding="UTF-8"?>
<testng-results skipped="0" failed="0" total="1" passed="1">
  <suite name="Suite1" duration-ms="1000">
    <test name="Test1">
      <class name="com.example.TestClass">
        <test-method name="testMethod1" status="PASS" duration-ms="500"/>
      </class>
    </test>
  </suite>
</testng-results>`;

const failXml = `<?xml version="1.0" encoding="UTF-8"?>
<testng-results skipped="0" failed="1" total="1" passed="0">
  <suite name="SuiteFail" duration-ms="2000">
    <test name="TestFail">
      <class name="com.example.FailClass">
        <test-method name="failMethod" status="FAIL" duration-ms="100">
          <exception>
            <message>Assertion failed</message>
            <full-stacktrace>java.lang.AssertionError: ...</full-stacktrace>
          </exception>
        </test-method>
      </class>
    </test>
  </suite>
</testng-results>`;

const skipXml = `<?xml version="1.0" encoding="UTF-8"?>
<testng-results skipped="1" failed="0" total="1" passed="0">
  <suite name="SuiteSkip" duration-ms="500">
    <test name="TestSkip">
      <class name="com.example.SkipClass">
        <test-method name="skipMethod" status="SKIP" duration-ms="50"/>
      </class>
    </test>
  </suite>
</testng-results>`;

const multiSuiteXml = `<?xml version="1.0" encoding="UTF-8"?>
<testng-results skipped="1" failed="1" total="3" passed="1">
  <suite name="SuiteA" duration-ms="1000">
    <test name="TestA">
      <class name="com.example.A">
        <test-method name="passA" status="PASS" duration-ms="100"/>
        <test-method name="failA" status="FAIL" duration-ms="200">
          <exception>
            <message>Failure A</message>
            <full-stacktrace>stacktraceA</full-stacktrace>
          </exception>
        </test-method>
      </class>
    </test>
  </suite>
  <suite name="SuiteB" duration-ms="2000">
    <test name="TestB">
      <class name="com.example.B">
        <test-method name="skipB" status="SKIP" duration-ms="50"/>
      </class>
    </test>
  </suite>
</testng-results>`;

const groupXml = `<?xml version="1.0" encoding="UTF-8"?>
<testng-results skipped="0" failed="0" total="1" passed="1">
  <suite name="SuiteGroup" duration-ms="100">
    <test name="TestGroup">
      <class name="com.example.GroupClass">
        <test-method name="groupedMethod" status="PASS" duration-ms="10" groups="group1,group2"/>
      </class>
    </test>
  </suite>
</testng-results>`;

const multiModuleXml = `<?xml version="1.0" encoding="UTF-8"?>
<testng-results skipped="0" failed="1" total="3" passed="2">
  <suite name="module-a" duration-ms="1200">
    <test name="TestA">
      <class name="com.company.modulea.ClassA">
        <test-method name="testA1" status="PASS" duration-ms="100"/>
        <test-method name="testA2" status="FAIL" duration-ms="200">
          <exception>
            <message>Failure in module-a</message>
            <full-stacktrace>stacktraceA2</full-stacktrace>
          </exception>
        </test-method>
      </class>
    </test>
  </suite>
  <suite name="module-b" duration-ms="800">
    <test name="TestB">
      <class name="org.example.moduleb.ClassB">
        <test-method name="testB1" status="PASS" duration-ms="150"/>
      </class>
    </test>
  </suite>
</testng-results>`;

describe("parseTestNGResult", () => {
  it("handles single test/class/method not in array", () => {
    const xml = `<?xml version='1.0' encoding='UTF-8'?>
      <testng-results skipped="0" failed="0" total="1" passed="1">
        <suite name="SuiteA" duration-ms="1000">
          <test name="TestA">
            <class name="ClassA">
              <test-method name="methodA" status="PASS" duration-ms="100"/>
            </class>
          </test>
        </suite>
      </testng-results>`;
    const suites = parseTestNGResult(xml);
    expect(suites[0].suiteName).toBe("SuiteA");
    expect(suites[0].testCases[0].name).toBe("methodA");
  });

  it("ignores methods with missing or invalid status", () => {
    const xml = `<?xml version='1.0' encoding='UTF-8'?>
      <testng-results skipped="0" failed="0" total="1" passed="1">
        <suite name="SuiteB" duration-ms="1000">
          <test name="TestB">
            <class name="ClassB">
              <test-method name="methodB" duration-ms="100"/>
              <test-method name="methodC" status="UNKNOWN" duration-ms="100"/>
            </class>
          </test>
        </suite>
      </testng-results>`;
    const suites = parseTestNGResult(xml);
    expect(suites[0].testCases.length).toBe(0);
  });

  it("parses exception and groups if present", () => {
    const xml = `<?xml version='1.0' encoding='UTF-8'?>
      <testng-results skipped="0" failed="1" total="1" passed="0">
        <suite name="SuiteC" duration-ms="1000">
          <test name="TestC">
            <class name="ClassC">
              <test-method name="methodC" status="FAIL" duration-ms="100" @_groups="g1,g2">
                <exception>
                  <message>fail msg</message>
                  <full-stacktrace>trace info</full-stacktrace>
                </exception>
              </test-method>
            </class>
          </test>
        </suite>
      </testng-results>`;
    const suites = parseTestNGResult(xml);
    const test = suites[0].testCases[0];
    expect(test.failureMessage).toBe("fail msg");
    expect(test.stackTrace).toBe("trace info");
    expect(test.groups).toBeUndefined();
  });

  it("handles missing exception and groups gracefully", () => {
    const xml = `<?xml version='1.0' encoding='UTF-8'?>
      <testng-results skipped="0" failed="1" total="1" passed="0">
        <suite name="SuiteD" duration-ms="1000">
          <test name="TestD">
            <class name="ClassD">
              <test-method name="methodD" status="FAIL" duration-ms="100"/>
            </class>
          </test>
        </suite>
      </testng-results>`;
    const suites = parseTestNGResult(xml);
    const test = suites[0].testCases[0];
    expect(test.failureMessage).toBeUndefined();
    expect(test.stackTrace).toBeUndefined();
    expect(test.groups).toBeUndefined();
  });
  it("parses minimal passing test", () => {
    const suites = parseTestNGResult(minimalXml);
    expect(suites).toHaveLength(1);
    const suite = suites[0];
    expect(suite.suiteName).toBe("Suite1");
    expect(suite.durationMs).toBe(1000);
    expect(suite.testCases).toHaveLength(1);
    const test = suite.testCases[0];
    expect(test.name).toBe("testMethod1");
    expect(test.className).toBe("com.example.TestClass");
    expect(test.durationMs).toBe(500);
    expect(test.status).toBe("PASS");
    expect(test.failureMessage).toBeUndefined();
    expect(test.stackTrace).toBeUndefined();
  });

  it("parses failed test with exception", () => {
    const suites = parseTestNGResult(failXml);
    expect(suites).toHaveLength(1);
    const test = suites[0].testCases[0];
    expect(test.status).toBe("FAIL");
    expect(test.failureMessage).toBe("Assertion failed");
    expect(test.stackTrace).toContain("AssertionError");
  });

  it("parses skipped test", () => {
    const suites = parseTestNGResult(skipXml);
    expect(suites).toHaveLength(1);
    const test = suites[0].testCases[0];
    expect(test.status).toBe("SKIP");
  });

  it("parses multiple suites and test cases", () => {
    const suites = parseTestNGResult(multiSuiteXml);
    expect(suites).toHaveLength(2);
    expect(suites[0].suiteName).toBe("SuiteA");
    expect(suites[1].suiteName).toBe("SuiteB");
    expect(suites[0].testCases).toHaveLength(2);
    expect(suites[1].testCases).toHaveLength(1);
    expect(suites[0].testCases[1].status).toBe("FAIL");
    expect(suites[1].testCases[0].status).toBe("SKIP");
  });

  it("parses test-method with groups", () => {
    const suites = parseTestNGResult(groupXml);
    const test = suites[0].testCases[0];
    expect(test.groups).toEqual(["group1", "group2"]);
  });

  it("handles missing/optional fields gracefully", () => {
    const xml = `<?xml version="1.0"?><testng-results><suite><test><class><test-method/></class></test></suite></testng-results>`;
    const suites = parseTestNGResult(xml);
    expect(suites[0].testCases).toHaveLength(0);
  });

  it("handles single suite/test/class/method not in array", () => {
    const xml = `<?xml version="1.0"?><testng-results><suite><test><class><test-method name="t1" status="PASS" duration-ms="1"/></class></test></suite></testng-results>`;
    const suites = parseTestNGResult(xml);
    expect(suites[0].testCases[0].name).toBe("t1");
  });

  it("parses multi-module Maven project with different base packages", () => {
    const suites = parseTestNGResult(multiModuleXml);
    expect(suites).toHaveLength(2);
    expect(suites[0].suiteName).toBe("module-a");
    expect(suites[1].suiteName).toBe("module-b");
    expect(suites[0].testCases).toHaveLength(2);
    expect(suites[1].testCases).toHaveLength(1);
    expect(suites[0].testCases[0].className).toBe("com.company.modulea.ClassA");
    expect(suites[1].testCases[0].className).toBe("org.example.moduleb.ClassB");
    expect(suites[0].testCases[1].status).toBe("FAIL");
    expect(suites[0].testCases[1].failureMessage).toBe("Failure in module-a");
    expect(suites[0].testCases[1].stackTrace).toBe("stacktraceA2");
    expect(suites[1].testCases[0].status).toBe("PASS");
  });
});
