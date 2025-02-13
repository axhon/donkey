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
    // expressions
    case node instanceof ast.IntegerLiteral: {
      return object.Integer.from(node.value!);
    }
    case node instanceof ast.BooleanExpression: {
      if (node.value) {
        return TRUE;
      }

      return FALSE;
    }
    case node instanceof ast.PrefixExpression: {
      const right = evaluate(node.right);
      return evaluatePrefixExpression(node.operator, right);
    }
    default: {
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
    default:
      return FALSE;
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
