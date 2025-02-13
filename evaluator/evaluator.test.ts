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
  ]);

  for (const { input, expected } of inputs) {
    const evaluated = doEvaluate(input);
    assertBooleanObject(evaluated, expected);
  }
});
