import { assert } from "std/assert/mod.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "./parser.ts";
import {
  ExpressionStatement,
  Identifier,
  LetStatement,
  ReturnStatement,
  IntegerLiteral,
} from "../ast/ast.ts";

Deno.test("let statements", async (t) => {
  const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`;

  const l = Lexer.from(input);
  const p = Parser.from(l);

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
        statement.name?.value === expectation,
        `statement.name.value was not ${expectation}, got: ${statement.name?.value}`,
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

  const l = Lexer.from(input);
  const parser = Parser.from(l);
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

Deno.test("identifier expressions", () => {
  const input = "foobar;";
  const l = Lexer.from(input);
  const parser = Parser.from(l);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);

  assert(
    program.statements.length === 1,
    `program does not have the right amount of statements, got: ${program.statements.length}`,
  );

  const statement = program.statements[0];

  assert(
    statement instanceof ExpressionStatement,
    `program.statements[0] is not an ExpressionStatement, got: ${program.statements[0].constructor.name}`,
  );

  const identifier = statement.expression;

  assert(
    identifier instanceof Identifier,
    `statement.expression was not an Identifier, got: ${identifier?.constructor.name}`,
  );

  assert(
    identifier.value === "foobar",
    `identifier.value was not foobar, got: ${identifier.value}`,
  );

  assert(
    identifier.tokenLiteral() === "foobar",
    `identifier.tokenLiteral() was not foobar, got: ${identifier.tokenLiteral()}`,
  );
});

Deno.test("integer literal expression", () => {
  const input = "5;";

  const lexer = Lexer.from(input);
  const parser = Parser.from(lexer);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);

  assert(
    program.statements.length === 1,
    `program does not have enough statements, got: ${program.statements.length}`,
  );

  const statement = program.statements[0];

  assert(
    statement instanceof ExpressionStatement,
    `program.statements[0] is not an ExpressionStatement, got: ${statement.constructor.name}`,
  );

  const literal = statement.expression;

  assert(
    literal instanceof IntegerLiteral,
    `expression was not IntegerLiteral, got: ${literal!.constructor.name}`,
  );

  assert(literal.value === 5, `value was not 5, got: ${literal.value}`);

  assert(
    literal?.tokenLiteral() === "5",
    `literal.tokenLiteral() was not "5", got: ${literal?.tokenLiteral()}`,
  );
});
