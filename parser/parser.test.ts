import { assert } from "std/assert/mod.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "./parser.ts";
import { LetStatement } from "../ast/ast.ts";

Deno.test("let statements", async (t) => {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

  const l = Lexer.create(input);
  const p = Parser.create(l);

  const program = p.parseProgram();

  assertParserHasNoErrors(p);

  assert(program !== null, "parseProgram() returned null");

  assert(
    program.statements.length === 3,
    `program.statements does not contain 3 statements. Got ${program.statements.length}`,
  );

  const expectations = ["x", "y", "foobar"];

  for (let index = 0; index < expectations.length; index++) {
    const expectation = expectations[index];
    const statement = program.statements[index];

    await t.step(`confirming ${expectation} in expectations`, () => {
      assert(
        statement.tokenLiteral() === "let",
        `the literal was not 'let', instead got: ${statement.tokenLiteral()}`,
      );

      assert(
        statement instanceof LetStatement,
        `statement was not an instance of 'LetStatement', got: ${statement.constructor.name}`,
      );

      assert(
        statement.name.value === expectation,
        `statement.name.value was not ${expectation}, got: ${statement.name.value}`,
      );

      assert(
        statement.name.tokenLiteral() === expectation,
        `statement.name.tokenLiteral() was not ${expectation}, got: ${statement.name.tokenLiteral()}`,
      );
    });
  }
});

function assertParserHasNoErrors(p: Parser) {
  assert(p.errors().length === 0, `parser has ${p.errors().length} errors`);
  for (const e of p.errors()) {
    console.error(e);
  }
}
