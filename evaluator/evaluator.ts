import * as object from "../object/object.ts";
import * as ast from "../ast/ast.ts";
import { assert } from "@std/assert";

export function evaluate(node: ast.Node): object.ProgramObject {
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
    default: {
      throw new Error("cannot evaluate" + ": " + node.toString());
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
