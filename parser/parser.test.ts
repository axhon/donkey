import { assert } from "@std/assert";
import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "./parser.ts";
import {
  BooleanExpression,
  Expression,
  ExpressionStatement,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  ReturnStatement,
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
    `program.statements[0] is not an ExpressionStatement, got: ${
      program.statements[0].constructor.name
    }`,
  );

  const identifier = statement.expression;

  assert(identifier !== null);

  assertIdentifier(identifier, "foobar");
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

  assertIntegerOrBooleanLiteral(literal, 5);
});

Deno.test("boolean expression", () => {
  const input = "true;";

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

  assert(literal !== null);

  assertBooleanExpression(literal, true);
});

Deno.test("parsing prefix expressions", () => {
  type Input = {
    input: string;
    operator: string;
    value: number | boolean;
  };

  const tests: Input[] = [
    { input: "!5;", operator: "!", value: 5 },
    { input: "-15;", operator: "-", value: 15 },
    { input: "!true;", operator: "!", value: true },
    { input: "!false;", operator: "!", value: false },
  ];

  for (const test of tests) {
    const lexer = Lexer.from(test.input);
    const parser = Parser.from(lexer);
    const program = parser.parseProgram();

    assertParserHasNoErrors(parser);

    assert(
      program.statements.length === 1,
      `program.statements does not contain 1 value, got: ${program.statements.length}`,
    );

    const statement = program.statements[0];
    assert(
      statement instanceof ExpressionStatement,
      `statement is not ExpressionStatement, got: ${statement.constructor.name}`,
    );

    const expression = statement.expression;
    assert(
      expression instanceof PrefixExpression,
      `expression is not PrefixExpression, got: ${expression?.constructor.name}`,
    );

    assert(
      expression.operator === test.operator,
      `expression.operator is not ${test.operator}, got: ${expression.operator}`,
    );

    assertIntegerOrBooleanLiteral(expression.right, test.value);
  }
});

Deno.test("parsing infix expressions", () => {
  interface TestInput {
    input: string;
    leftValue: number | boolean;
    operator: string;
    rightValue: number | boolean;
  }

  function makeInput(
    input: string,
    leftValue: number | boolean,
    operator: string,
    rightValue: number | boolean,
  ) {
    return { input, leftValue, operator, rightValue };
  }

  const tests: TestInput[] = [
    makeInput("5 + 5;", 5, "+", 5),
    makeInput("5 - 5;", 5, "-", 5),
    makeInput("5 * 5;", 5, "*", 5),
    makeInput("5 / 5;", 5, "/", 5),
    makeInput("5 > 5;", 5, ">", 5),
    makeInput("5 < 5;", 5, "<", 5),
    makeInput("5 == 5;", 5, "==", 5),
    makeInput("5 != 5;", 5, "!=", 5),
    makeInput("true == true", true, "==", true),
    makeInput("true != false", true, "!=", false),
    makeInput("false == false", false, "==", false),
  ];

  for (const test of tests) {
    const l = Lexer.from(test.input);
    const p = Parser.from(l);
    const program = p.parseProgram();

    assertParserHasNoErrors(p);

    assert(
      program.statements.length === 1,
      `program.statements does not contain 1 statement, got ${program.statements.length}`,
    );

    const statement = program.statements[0];

    assert(
      statement instanceof ExpressionStatement,
      `statement is not an ExpressionStatement, got ${statement.constructor.name}`,
    );

    const expression = statement.expression;

    assert(expression !== null, `expression is null`);

    assertInfixExpression(
      expression,
      test.leftValue,
      test.operator,
      test.rightValue,
    );
  }
});

Deno.test("operator precedence parsing", () => {
  interface TestInput {
    input: string;
    expected: string;
  }

  function makeInput(input: string, expected: string) {
    return { input, expected };
  }

  const tests: TestInput[] = [
    makeInput("-a * b", "((-a) * b)"),
    makeInput("!-a", "(!(-a))"),
    makeInput("a + b + c", "((a + b) + c)"),
    makeInput("a + b - c", "((a + b) - c)"),
    makeInput("a * b * c", "((a * b) * c)"),
    makeInput("a * b / c", "((a * b) / c)"),
    makeInput("a + b / c", "(a + (b / c))"),
    makeInput("a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f)"),
    makeInput("3 + 4; -5 * 5", "(3 + 4)((-5) * 5)"),
    makeInput("5 > 4 == 3 < 4", "((5 > 4) == (3 < 4))"),
    makeInput("5 < 4 != 3 > 4", "((5 < 4) != (3 > 4))"),
    makeInput(
      "3 + 4 * 5 == 3 * 1 + 4 * 5",
      "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
    ),
    makeInput("true", "true"),
    makeInput("false", "false"),
    makeInput("3 > 5 == false", "((3 > 5) == false)"),
    makeInput("3 < 5 == true", "((3 < 5) == true)"),
    makeInput("1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"),
    makeInput("(5 + 5) * 2", "((5 + 5) * 2)"),
    makeInput("2 / (5 + 5)", "(2 / (5 + 5))"),
    makeInput("-(5 + 5)", "(-(5 + 5))"),
    makeInput("!(true == true)", "(!(true == true))"),
  ];

  for (const { input, expected } of tests) {
    const l = Lexer.from(input);
    const p = Parser.from(l);
    const program = p.parseProgram();

    assertParserHasNoErrors(p);

    const actual = program.toString();

    assert(actual === expected, `expected ${expected} but got ${actual}`);
  }
});

function assertIntegerOrBooleanLiteral(
  literal: Expression | null | undefined,
  value: number | boolean,
) {
  assert(literal !== null, "literal was null");
  assert(literal !== undefined, "literal was undefined");

  assert(
    literal instanceof IntegerLiteral || literal instanceof BooleanExpression,
    `literal was not IntegerLiteral or BooleanExpression, got: ${literal.constructor.name}`,
  );

  assert(
    literal.value === value,
    `literal.value was not ${value}, got: ${literal.value}`,
  );

  assert(
    literal.tokenLiteral() === `${value}`,
    `literal.tokenLiteral() not ${value}, got: ${literal.tokenLiteral()}`,
  );
}

function assertIdentifier(exp: Expression, value: string) {
  assert(
    exp instanceof Identifier,
    `exp was not Identifier, got ${exp.constructor.name}`,
  );

  assert(exp.value === value, `value was not ${value}, got ${exp.value}`);

  assert(
    exp.tokenLiteral() === value,
    `tokenLiteral was not ${value}, got ${exp.tokenLiteral()}`,
  );
}

function assertBooleanExpression(exp: Expression, value: boolean) {
  assert(
    exp instanceof BooleanExpression,
    `exp is not a BooleanExpression, got ${exp.constructor.name}`,
  );

  assert(exp.value === value, `value was not ${value}, got ${exp.value}`);
}

function assertLiteralExpression(exp: Expression, expected: unknown) {
  switch (typeof expected) {
    case "string": {
      assertIdentifier(exp, expected);
      break;
    }
    case "number": {
      assertIntegerOrBooleanLiteral(exp, expected);
      break;
    }
    case "boolean": {
      assertBooleanExpression(exp, expected);
      break;
    }
    default: {
      throw Error("unhandled expression type");
    }
  }
}

function assertInfixExpression(
  exp: Expression,
  left: unknown,
  operator: string,
  right: unknown,
) {
  assert(
    exp instanceof InfixExpression,
    `exp is not an InfixExpression, got ${exp.constructor.name}`,
  );

  assertLiteralExpression(exp.left, left);

  assert(
    exp.operator === operator,
    `operator is not ${operator}, got ${exp.operator}`,
  );

  assert(exp.right);

  assertLiteralExpression(exp.right, right);
}
