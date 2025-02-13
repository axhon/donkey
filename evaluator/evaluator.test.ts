import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "../parser/parser.ts";
import { makeInputs } from "../utils/test-helpers.ts";
import * as object from "../object/object.ts";
import {
  assertBooleanObject,
  assertIntegerObject,
} from "../utils/assertions.ts";
import { evaluate } from "./evaluator.ts";

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

  return evaluate(program);
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
