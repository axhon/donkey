import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import { Lexer } from "../lexer/lexer.ts";
import { Parser } from "./parser.ts";
import {
  BooleanExpression,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
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

  assert(program);

  assertEquals(
    program.statements.length,
    3,
  );

  const expectations = ["x", "y", "foobar"];

  for (let index = 0; index < expectations.length; index++) {
    const expectation = expectations[index];
    const statement = program.statements[index];

    await t.step(`confirming ${expectation} in expectations`, () => {
      assertEquals(
        statement.tokenLiteral(),
        "let",
      );

      assertInstanceOf(statement, LetStatement);

      assertEquals(
        statement.name?.value,
        expectation,
      );
      assert(statement.name);
      assertEquals(
        statement.name.tokenLiteral(),
        expectation,
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

  assertEquals(
    program.statements.length,
    3,
  );

  for (const statement of program.statements) {
    assertInstanceOf(
      statement,
      ReturnStatement,
    );
    assertEquals(
      statement.tokenLiteral(),
      "return",
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

function makeInputs<Value = unknown>(inputs: [string, Value][]) {
  return inputs.map(([input, expected]) => ({ input, expected }));
}
