import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "./parser.ts";
import {
  CallExpression,
  ExpressionStatement,
  FunctionLiteral,
  IfExpression,
  PrefixExpression,
  ReturnStatement,
} from "../ast/ast.ts";
import {
  assertBooleanExpression,
  assertIdentifier,
  assertInfixExpression,
  assertIntegerOrBooleanLiteral,
  assertLetStatement,
  assertLiteralExpression,
  assertParserHasNoErrors,
} from "../utils/assertions.ts";
import { makeInputs } from "../utils/test-helpers.ts";

Deno.test("let statements", () => {
  const inputs = makeInputs([
    [`let x = 5;`, { identifier: "x", value: 5 }],
    [
      `let y = true;`,
      { identifier: "y", value: true },
    ],
    [
      `let foobar = y;`,
      { identifier: "foobar", value: "y" },
    ],
  ]);

  for (const { input, expected } of inputs) {
    const l = Lexer.from(input);
    const p = Parser.from(l);

    const program = p.parseProgram();

    assertParserHasNoErrors(p);

    assert(program);

    assertEquals(
      program.statements.length,
      1,
    );

    const statement = program.statements[0];
    assertLetStatement(statement, expected.identifier);

    const value = statement.value;
    assert(value);
    assertLiteralExpression(value, expected.value);
  }
});

Deno.test("return statements", () => {
  const inputs = makeInputs([
    [`return 5;`, { value: 5 }],
    [`return 10;`, { value: 10 }],
  ]);

  for (const { input, expected } of inputs) {
    const l = Lexer.from(input);
    const parser = Parser.from(l);
    const program = parser.parseProgram();

    assertParserHasNoErrors(parser);

    assertEquals(
      program.statements.length,
      1,
    );

    const statement = program.statements[0];

    assertInstanceOf(
      statement,
      ReturnStatement,
    );
    assertEquals(
      statement.tokenLiteral(),
      "return",
    );
    assert(statement.returnValue);
    assertLiteralExpression(statement.returnValue, expected.value);
  }
});

Deno.test("identifier expressions", () => {
  const input = "foobar;";
  const l = Lexer.from(input);
  const parser = Parser.from(l);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);

  assertEquals(
    program.statements.length,
    1,
  );

  const statement = program.statements[0];

  assertInstanceOf(
    statement,
    ExpressionStatement,
  );

  const identifier = statement.expression;

  assert(identifier);

  assertIdentifier(identifier, "foobar");
});

Deno.test("integer literal expression", () => {
  const input = "5;";

  const lexer = Lexer.from(input);
  const parser = Parser.from(lexer);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);

  assertEquals(
    program.statements.length,
    1,
  );

  const statement = program.statements[0];

  assertInstanceOf(
    statement,
    ExpressionStatement,
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

  assertEquals(
    program.statements.length,
    1,
  );

  const statement = program.statements[0];

  assertInstanceOf(
    statement,
    ExpressionStatement,
  );

  const literal = statement.expression;

  assert(literal);

  assertBooleanExpression(literal, true);
});

Deno.test("parsing prefix expressions", () => {
  const tests = makeInputs([
    ["!5;", { operator: "!", value: 5 }],
    ["-15;", { operator: "-", value: 15 }],
    ["!true;", { operator: "!", value: true }],
    ["!false;", { operator: "!", value: false }],
  ]);

  for (const { input, expected } of tests) {
    const lexer = Lexer.from(input);
    const parser = Parser.from(lexer);
    const program = parser.parseProgram();

    assertParserHasNoErrors(parser);

    assertEquals(
      program.statements.length,
      1,
    );

    const statement = program.statements[0];
    assertInstanceOf(
      statement,
      ExpressionStatement,
    );

    const expression = statement.expression;
    assertInstanceOf(
      expression,
      PrefixExpression,
    );

    assertEquals(
      expression.operator,
      expected.operator,
    );

    assertIntegerOrBooleanLiteral(expression.right, expected.value);
  }
});

Deno.test("parsing infix expressions", () => {
  function makeExpected(
    leftValue: number | boolean,
    operator: string,
    rightValue: number | boolean,
  ) {
    return { leftValue, operator, rightValue };
  }

  const inputs = makeInputs([
    ["5 + 5;", makeExpected(5, "+", 5)],
    ["5 - 5;", makeExpected(5, "-", 5)],
    ["5 * 5;", makeExpected(5, "*", 5)],
    ["5 / 5;", makeExpected(5, "/", 5)],
    ["5 > 5;", makeExpected(5, ">", 5)],
    ["5 < 5;", makeExpected(5, "<", 5)],
    ["5 == 5;", makeExpected(5, "==", 5)],
    ["5 != 5;", makeExpected(5, "!=", 5)],
    ["true == true", makeExpected(true, "==", true)],
    ["true != false", makeExpected(true, "!=", false)],
    ["false == false", makeExpected(false, "==", false)],
  ]);

  for (const { input, expected } of inputs) {
    const l = Lexer.from(input);
    const p = Parser.from(l);
    const program = p.parseProgram();

    assertParserHasNoErrors(p);

    assertEquals(
      program.statements.length,
      1,
    );

    const statement = program.statements[0];

    assertInstanceOf(
      statement,
      ExpressionStatement,
    );

    const expression = statement.expression;

    assert(expression);

    assertInfixExpression(
      expression,
      expected.leftValue,
      expected.operator,
      expected.rightValue,
    );
  }
});

Deno.test("operator precedence parsing", () => {
  const inputs = makeInputs([
    ["-a * b", "((-a) * b)"],
    ["!-a", "(!(-a))"],
    ["a + b + c", "((a + b) + c)"],
    ["a + b - c", "((a + b) - c)"],
    ["a * b * c", "((a * b) * c)"],
    ["a * b / c", "((a * b) / c)"],
    ["a + b / c", "(a + (b / c))"],
    ["a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f)"],
    ["3 + 4; -5 * 5", "(3 + 4)((-5) * 5)"],
    ["5 > 4 == 3 < 4", "((5 > 4) == (3 < 4))"],
    ["5 < 4 != 3 > 4", "((5 < 4) != (3 > 4))"],
    ["3 + 4 * 5 == 3 * 1 + 4 * 5", "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))"],
    ["true", "true"],
    ["false", "false"],
    ["3 > 5 == false", "((3 > 5) == false)"],
    ["3 < 5 == true", "((3 < 5) == true)"],
    ["1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"],
    ["(5 + 5) * 2", "((5 + 5) * 2)"],
    ["2 / (5 + 5)", "(2 / (5 + 5))"],
    ["-(5 + 5)", "(-(5 + 5))"],
    ["!(true == true)", "(!(true == true))"],
  ]);

  for (const { input, expected } of inputs) {
    const l = Lexer.from(input);
    const p = Parser.from(l);
    const program = p.parseProgram();

    assertParserHasNoErrors(p);

    const actual = program.toString();

    assertEquals(actual, expected);
  }
});

Deno.test("if expression", () => {
  const input = "if (x < y) { x }";

  const lexer = Lexer.from(input);
  const parser = Parser.from(lexer);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);

  assertEquals(
    program.statements.length,
    1,
  );

  const statement = program.statements[0];
  assertInstanceOf(
    statement,
    ExpressionStatement,
  );
  const expression = statement.expression;
  assert(expression);
  assertInstanceOf(
    expression,
    IfExpression,
  );
  assert(expression.condition);
  assertInfixExpression(expression.condition, "x", "<", "y");

  assert(expression.consequence);
  assert(expression.consequence.statements.length === 1);
  const consequence = expression.consequence.statements[0];

  assertInstanceOf(
    consequence,
    ExpressionStatement,
  );
  assert(consequence.expression);
  assertIdentifier(consequence.expression, "x");

  assertEquals(expression.alternative, undefined);
});

Deno.test("if else expression", () => {
  const input = "if (x < y) { x } else { y }";

  const lexer = Lexer.from(input);
  const parser = Parser.from(lexer);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);

  assertEquals(
    program.statements.length,
    1,
  );

  const statement = program.statements[0];
  assertInstanceOf(
    statement,
    ExpressionStatement,
  );
  const expression = statement.expression;
  assert(expression);
  assertInstanceOf(
    expression,
    IfExpression,
  );
  assert(expression.condition);
  assertInfixExpression(expression.condition, "x", "<", "y");

  assert(expression.consequence);
  assertEquals(expression.consequence.statements.length, 1);
  const consequence = expression.consequence.statements[0];

  assertInstanceOf(
    consequence,
    ExpressionStatement,
  );
  assert(consequence.expression);
  assertIdentifier(consequence.expression, "x");

  assert(expression.alternative);
  assertEquals(expression.alternative.statements.length, 1);
  const alternative = expression.alternative.statements[0];

  assertInstanceOf(
    alternative,
    ExpressionStatement,
  );
  assert(alternative.expression);
  assertIdentifier(alternative.expression, "y");
});

Deno.test("function literal parsing", () => {
  const input = "fn(x, y) { x + y; }";

  const lexer = Lexer.from(input);
  const parser = Parser.from(lexer);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);
  assertEquals(program.statements.length, 1);

  const statement = program.statements[0];
  assertInstanceOf(statement, ExpressionStatement);

  const fn = statement.expression;
  assertInstanceOf(fn, FunctionLiteral);
  assertEquals(fn.parameters.length, 2);
  assertLiteralExpression(fn.parameters[0], "x");
  assertLiteralExpression(fn.parameters[1], "y");

  const body = fn.body;
  assert(body);
  assertEquals(body.statements.length, 1);

  const bodyStatement = body.statements[0];
  assertInstanceOf(bodyStatement, ExpressionStatement);
  assert(bodyStatement.expression);
  assertInfixExpression(bodyStatement.expression, "x", "+", "y");
});

Deno.test("function parameter parsing", () => {
  const inputs = makeInputs([
    ["fn() {}", []],
    ["fn(x) {}", ["x"]],
    ["fn(x, y, z) {}", ["x", "y", "z"]],
  ]);

  for (const { input, expected } of inputs) {
    const lexer = Lexer.from(input);
    const parser = Parser.from(lexer);
    const program = parser.parseProgram();

    assertParserHasNoErrors(parser);

    const statement = program.statements[0];
    assertInstanceOf(statement, ExpressionStatement);

    const fn = statement.expression;
    assert(fn);
    assertInstanceOf(fn, FunctionLiteral);

    assert(fn.parameters.length === expected.length);

    expected.forEach((param, idx) => {
      assertLiteralExpression(fn.parameters[idx], param);
    });
  }
});

Deno.test("call expression parsing", () => {
  const input = "add(1, 2 * 3, 4 + 5);";

  const lexer = Lexer.from(input);
  const parser = Parser.from(lexer);
  const program = parser.parseProgram();

  assertParserHasNoErrors(parser);
  assertEquals(program.statements.length, 1);

  const statement = program.statements[0];
  assertInstanceOf(statement, ExpressionStatement);

  const expression = statement.expression;
  assert(expression);
  assertInstanceOf(expression, CallExpression);
  assert(expression.fn);
  assertIdentifier(expression.fn, "add");
  assertEquals(expression.arguments.length, 3);
  assertLiteralExpression(expression.arguments[0], 1);
  assertInfixExpression(expression.arguments[1], 2, "*", 3);
  assertInfixExpression(expression.arguments[2], 4, "+", 5);
});

Deno.test("operator precedence parsing", () => {
  const inputs = makeInputs([
    ["a + add(b * c) + d", "((a + add((b * c))) + d)"],
    [
      "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
      "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
    ],
    [
      "add(a + b + c * d / f + g)",
      "add((((a + b) + ((c * d) / f)) + g))",
    ],
  ]);

  for (const { input, expected } of inputs) {
    const lexer = Lexer.from(input);
    const parser = Parser.from(lexer);
    const program = parser.parseProgram();

    assertParserHasNoErrors(parser);

    const actual = program.toString();
    assertEquals(actual, expected);
  }
});
