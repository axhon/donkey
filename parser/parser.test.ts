import { assert } from "std/assert/mod.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "./parser.ts";
import { LetStatement, ReturnStatement } from "../ast/ast.ts";

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

Deno.test("return statements", () => {
  const input = `
return 5;
return 10;
return 993322;
`;

  const l = Lexer.create(input);
  const parser = Parser.create(l);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);

  assert(
    program.statements.length === 3,
    `program.statements does not have 3 statements, got: ${program.statements.length}`,
  );

  for (const statement of program.statements) {
    assert(
      statement instanceof ReturnStatement,
      `statement was not an instance of ReturnStatement, instead got ${statement.constructor.name}`,
    );
    assert(
      statement.tokenLiteral() === "return",
      `tokenLiteral() was not 'return', got: ${statement.tokenLiteral()}`,
    );
  }
});

function assertParserHasNoErrors(p: Parser) {
  for (const e of p.errors()) {
    console.error(e);
  }

  assert(p.errors().length === 0, `parser has ${p.errors().length} errors`);
}
