import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import {
  BooleanExpression,
  Expression,
  Identifier,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  Statement,
} from "../ast/ast.ts";
import { Parser } from "../parser/parser.ts";
import * as object from "../object/object.ts";

export function assertLetStatement(
  stmt: Statement | null | undefined,
  ident: string,
): asserts stmt is InstanceType<typeof LetStatement> {
  assert(stmt);

  assertInstanceOf(stmt, LetStatement);
  assert(stmt.name);
  assertEquals(stmt.name.value, ident);
}

export function assertIntegerOrBooleanLiteral(
  literal: Expression | null | undefined,
  value: number | boolean,
): asserts literal is InstanceType<
  typeof IntegerLiteral | typeof BooleanExpression
> {
  assert(literal);

  assert(
    literal instanceof IntegerLiteral || literal instanceof BooleanExpression,
    `literal was not IntegerLiteral or BooleanExpression, got: ${literal.constructor.name}`,
  );

  assertEquals(
    literal.value,
    value,
  );

  assertEquals(
    literal.tokenLiteral(),
    value.toString(),
  );
}

export function assertIdentifier(
  exp: Expression,
  value: string,
): asserts exp is InstanceType<typeof Identifier> {
  assertInstanceOf(
    exp,
    Identifier,
  );

  assertEquals(exp.value, value);

  assertEquals(
    exp.tokenLiteral(),
    value,
  );
}

export function assertBooleanExpression(
  exp: Expression,
  value: boolean,
): asserts exp is InstanceType<typeof BooleanExpression> {
  assertInstanceOf(
    exp,
    BooleanExpression,
  );

  assertEquals(exp.value, value);
}

export function assertLiteralExpression(exp: Expression, expected: unknown) {
  switch (typeof expected) {
    case "string": {
      return assertIdentifier(exp, expected);
    }
    case "number": {
      return assertIntegerOrBooleanLiteral(exp, expected);
    }
    case "boolean": {
      return assertBooleanExpression(exp, expected);
    }
    default: {
      throw Error("unhandled expression type");
    }
  }
}

export function assertInfixExpression(
  exp: Expression,
  left: unknown,
  operator: string,
  right: unknown,
): asserts exp is InstanceType<typeof InfixExpression> {
  assertInstanceOf(
    exp,
    InfixExpression,
  );

  assertLiteralExpression(exp.left, left);

  assertEquals(
    exp.operator,
    operator,
  );

  assert(exp.right);

  assertLiteralExpression(exp.right, right);
}

export function assertParserHasNoErrors(p: Parser) {
  for (const e of p.errors()) {
    console.error(e);
  }

  assertEquals(p.errors().length, 0, `parser has ${p.errors().length} errors`);
}

export function assertIntegerObject(
  obj: unknown,
  expected: number,
): asserts obj is object.Integer {
  assertInstanceOf(obj, object.Integer);
  assertEquals(obj.value, expected);
}

export function assertBooleanObject(
  obj: unknown,
  expected: boolean,
): asserts obj is object.Boolean {
  assertInstanceOf(obj, object.Boolean);
  assertEquals(obj.value, expected);
}
