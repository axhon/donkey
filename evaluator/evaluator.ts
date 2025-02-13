import * as object from "../object/object.ts";
import * as ast from "../ast/ast.ts";
import { assert } from "@std/assert";

const TRUE = object.Boolean.from(true);
const FALSE = object.Boolean.from(false);
const NULL = object.Null.from();

export function evaluate(node: ast.Node | null): object.ProgramObject {
  switch (true) {
    // statements
    case node instanceof ast.Program: {
      return evaluateStatements(node.statements);
    }
    case node instanceof ast.ExpressionStatement: {
      assert(node.expression);
      return evaluate(node.expression);
    }
    case node instanceof ast.BlockStatement: {
      return evaluateStatements(node.statements);
    }
    // expressions
    case node instanceof ast.IfExpression: {
      return evaluateIfExpression(node);
    }
    case node instanceof ast.IntegerLiteral: {
      return object.Integer.from(node.value!);
    }
    case node instanceof ast.BooleanExpression: {
      return translateBool(node.value);
    }
    case node instanceof ast.PrefixExpression: {
      const right = evaluate(node.right);
      return evaluatePrefixExpression(node.operator, right);
    }
    case node instanceof ast.InfixExpression: {
      const left = evaluate(node.left);
      const right = evaluate(node.right ?? null);
      return evaluateInfixExpression(node.operator, left, right);
    }
    default: {
      console.log(node);
      throw new Error("cannot evaluate" + ": " + node?.toString());
    }
  }
}

function evaluateStatements(statements: ast.Statement[]): object.ProgramObject {
  let result: object.ProgramObject;

  for (const statement of statements) {
    result = evaluate(statement);
  }

  return result!;
}

function evaluatePrefixExpression(
  operator: string,
  right: object.ProgramObject,
): object.ProgramObject {
  switch (operator) {
    case "!": {
      return evaluateBangOperatorExpression(right);
    }
    case "-": {
      return evaluateMinusPrefixOperatorExpression(right);
    }
    default:
      return NULL;
  }
}

function evaluateBangOperatorExpression(
  right: object.ProgramObject,
): object.ProgramObject {
  switch (right) {
    case TRUE: {
      return FALSE;
    }
    case FALSE: {
      return TRUE;
    }
    case NULL: {
      return TRUE;
    }
    default: {
      return FALSE;
    }
  }
}

function evaluateMinusPrefixOperatorExpression(
  right: object.ProgramObject,
): object.ProgramObject {
  if (!(right instanceof object.Integer)) {
    return NULL;
  }

  return object.Integer.from(-right.value);
}

function evaluateInfixExpression(
  operator: string,
  left: object.ProgramObject,
  right: object.ProgramObject,
) {
  switch (true) {
    case (left instanceof object.Integer) &&
      (right instanceof object.Integer): {
      return evaluateIntegerInfixExpression(operator, left, right);
    }
    case operator === "==": {
      return translateBool(left === right);
    }
    case operator === "!=": {
      return translateBool(left !== right);
    }
    default: {
      return NULL;
    }
  }
}

function evaluateIntegerInfixExpression(
  operator: string,
  left: object.Integer,
  right: object.Integer,
): object.ProgramObject {
  const leftValue = left.value,
    rightValue = right.value;

  switch (operator) {
    case "+": {
      return object.Integer.from(leftValue + rightValue);
    }
    case "-": {
      return object.Integer.from(leftValue - rightValue);
    }
    case "*": {
      return object.Integer.from(leftValue * rightValue);
    }
    case "/": {
      return object.Integer.from(leftValue / rightValue);
    }
    case "<": {
      return translateBool(leftValue < rightValue);
    }
    case ">": {
      return translateBool(leftValue > rightValue);
    }
    case "==": {
      return translateBool(leftValue === rightValue);
    }
    case "!=": {
      return translateBool(leftValue !== rightValue);
    }
    default: {
      return NULL;
    }
  }
}

function translateBool(b: boolean): object.Boolean {
  if (b) return TRUE;

  return FALSE;
}

function evaluateIfExpression(expr: ast.IfExpression) {
  const condition = evaluate(expr.condition!);

  if (isTruthy(condition)) {
    return evaluate(expr.consequence!);
  } else if (expr.alternative) {
    return evaluate(expr.alternative);
  }

  return NULL;
}

function isTruthy(obj: object.ProgramObject): boolean {
  switch (obj) {
    case NULL: {
      return false;
    }
    case FALSE: {
      return false;
    }
    default: {
      return true;
    }
  }
}
