import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "../parser/parser.ts";
import { makeInputs } from "../utils/test-helpers.ts";
import * as object from "../object/object.ts";
import {
  assertBooleanObject,
  assertIntegerObject,
  assertNullObject,
} from "../utils/assertions.ts";
import { evaluate } from "./evaluator.ts";
import { assertEquals, assertInstanceOf } from "@std/assert";
import { Environment } from "../object/environment.ts";

Deno.test("evaluate integer expression", () => {
  const inputs = makeInputs([
    ["5", 5],
    ["10", 10],
    ["-5", -5],
    ["-10", -10],
    ["5 + 5 + 5 + 5 - 10", 10],
    ["2 * 2 * 2 * 2 * 2", 32],
    ["-50 + 100 + -50", 0],
    ["5 * 2 + 10", 20],
    ["5 + 2 * 10", 25],
    ["20 + 2 * -10", 0],
    ["50 / 2 * 2 + 10", 60],
    ["2 * (5 + 10)", 30],
    ["3 * 3 * 3 + 10", 37],
    ["3 * (3 * 3) + 10", 37],
    ["(5 + 10 * 2 + 15 / 3) * 2 + -10", 50],
  ]);

  for (const { input, expected } of inputs) {
    const evaluated = doEvaluate(input);
    assertIntegerObject(evaluated, expected);
  }
});

function doEvaluate(input: string): object.ProgramObject {
  const lexer = Lexer.from(input);
  const parser = Parser.from(lexer);
  const program = parser.parseProgram();
  const env = Environment.from();

  return evaluate(program, env);
}

Deno.test("evalute boolean expression", () => {
  const inputs = makeInputs([
    ["true", true],
    ["false", false],
    ["true == false", false],
    ["true != false", true],
    ["false != true", true],
    ["(1 < 2) == true", true],
    ["(1 < 2) == false", false],
    ["(1 > 2) == true", false],
    ["(1 > 2) == false", true],
  ]);

  for (const { input, expected } of inputs) {
    const evaluated = doEvaluate(input);
    assertBooleanObject(evaluated, expected);
  }
});

Deno.test("bang operator", () => {
  const inputs = makeInputs([
    ["!true", false],
    ["!false", true],
    ["!5", false],
    ["!!true", true],
    ["!!false", false],
    ["!!5", true],
  ]);

  for (const { input, expected } of inputs) {
    const evaluated = doEvaluate(input);
    assertBooleanObject(evaluated, expected);
  }
});

Deno.test("if else expressions", () => {
  const inputs = makeInputs([
    ["if (true) { 10 }", 10],
    ["if (false) { 10 }", null],
    ["if (1) { 10 }", 10],
    ["if (1 < 2) { 10 }", 10],
    ["if (1 > 2) { 10 }", null],
    ["if (1 > 2) { 10 } else { 20 }", 20],
    ["if (1 < 2) { 10 } else { 20 }", 10],
  ]);

  for (const { input, expected } of inputs) {
    const evaluated = doEvaluate(input);
    if (typeof expected === "number") {
      assertIntegerObject(evaluated, expected);
    } else {
      assertNullObject(evaluated);
    }
  }
});

Deno.test("return statements", () => {
  const inputs = makeInputs([
    ["return 10;", 10],
    ["return 10; 9;", 10],
    ["return 2 * 5; 9;", 10],
    ["9; return 2 * 5; 9;", 10],
    [
      `
if (10 > 1) {
  if (10 > 1) {
    return 10;
  }

  return 1;
}
`,
      10,
    ],
  ]);

  for (const { input, expected } of inputs) {
    const evaluated = doEvaluate(input);
    assertIntegerObject(evaluated, expected);
  }
});

Deno.test("error handling", () => {
  const inputs = makeInputs([
    [
      "5 + true;",
      "type mismatch: INTEGER + BOOLEAN",
    ],
    [
      "5 + true; 5;",
      "type mismatch: INTEGER + BOOLEAN",
    ],
    [
      "-true",
      "unknown operator: -BOOLEAN",
    ],
    [
      "true + false",
      "unknown operator: BOOLEAN + BOOLEAN",
    ],
    [
      "5; true + false; 5",
      "unknown operator: BOOLEAN + BOOLEAN",
    ],
    [
      "if (10 > 1) { true + false; }",
      "unknown operator: BOOLEAN + BOOLEAN",
    ],
    [
      `
if (10 > 1) {
  if (10 > 1) {
    return true + false;
  }

  return 1;
}
`,
      "unknown operator: BOOLEAN + BOOLEAN",
    ],
    ["foobar", "identifier not found: foobar"],
  ]);

  for (const { input, expected } of inputs) {
    const evaluated = doEvaluate(input);
    assertInstanceOf(evaluated, object.ProgramError);
    assertEquals(evaluated.message, expected);
  }
});

Deno.test("let statements", () => {
  const inputs = makeInputs([
    ["let a = 5; a;", 5],
    ["let a = 5 * 5; a;", 25],
    ["let a = 5; let b = a; b;", 5],
    ["let a = 5; let b = a; let c = a + b + 5; c;", 15],
  ]);

  for (const { input, expected } of inputs) {
    assertIntegerObject(doEvaluate(input), expected);
  }
});

Deno.test("function object", () => {
  const input = "fn(x) { x + 2; };";

  const evaluated = doEvaluate(input);
  assertInstanceOf(evaluated, object.FunctionObject);
  assertEquals(evaluated.parameters.length, 1);
  assertEquals(evaluated.parameters[0].toString(), "x");
  assertEquals(evaluated.body.toString(), "(x + 2)");
});

Deno.test("function application", () => {
  const inputs = makeInputs([
    ["let identity = fn(x) { x; }; identity(5);", 5],
    ["let identity = fn(x) { return x; }; identity(5);", 5],
    ["let double = fn(x) { x * 2; }; double(5);", 10],
    ["let add = fn(x, y) { x + y; }; add(5, 5);", 10],
    ["let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", 20],
    ["fn(x) { x; }(5)", 5],
  ]);

  for (const { input, expected } of inputs) {
    assertIntegerObject(doEvaluate(input), expected);
  }
});

Deno.test("closures", () => {
  const input = `let newAdder = fn(x) {
  fn(y) { x + y };
}

let addTwo = newAdder(2);
addTwo(2);`;

  assertIntegerObject(doEvaluate(input), 4);
});
