import * as object from "../object/object.ts";
import * as ast from "../ast/ast.ts";
import { assert } from "@std/assert";
import { Environment } from "../object/environment.ts";

const TRUE = object.Boolean.from(true);
const FALSE = object.Boolean.from(false);
const NULL = object.Null.from();

function isError(e: unknown): e is object.ProgramError {
  return e instanceof object.ProgramError;
}

export function evaluate(
  node: ast.Node | null,
  env: Environment,
): object.ProgramObject {
  switch (true) {
    // statements
    case node instanceof ast.Program: {
      return evaluateProgram(node.statements, env);
    }
    case node instanceof ast.ExpressionStatement: {
      assert(node.expression);
      return evaluate(node.expression, env);
    }
    case node instanceof ast.BlockStatement: {
      return evaluateBlockStatement(node, env);
    }
    case node instanceof ast.ReturnStatement: {
      const value = evaluate(node.returnValue, env);
      if (isError(value)) return value;

      return object.ReturnValue.from(value);
    }
    case node instanceof ast.LetStatement: {
      const value = evaluate(node.value, env);
      if (isError(value)) return value;

      assert(node.name);
      return env.set(node.name.value, value);
    }
    // expressions
    case node instanceof ast.IfExpression: {
      return evaluateIfExpression(node, env);
    }
    case node instanceof ast.IntegerLiteral: {
      return object.Integer.from(node.value!);
    }
    case node instanceof ast.BooleanExpression: {
      return translateBool(node.value);
    }
    case node instanceof ast.PrefixExpression: {
      const right = evaluate(node.right, env);
      if (isError(right)) return right;

      return evaluatePrefixExpression(node.operator, right);
    }
    case node instanceof ast.InfixExpression: {
      const left = evaluate(node.left, env);
      if (isError(left)) return left;

      const right = evaluate(node.right ?? null, env);
      if (isError(right)) return right;

      return evaluateInfixExpression(node.operator, left, right);
    }
    case node instanceof ast.Identifier: {
      return evaluateIdentifier(node, env);
    }
    case node instanceof ast.FunctionLiteral: {
      const params = node.parameters;
      const body = node.body;
      assert(body);
      return object.FunctionObject.from(params, body, env);
    }
    case node instanceof ast.CallExpression: {
      const f = evaluate(node.fn!, env);
      if (isError(f)) return f;

      const args = evaluateExpressions(node.arguments, env);

      if (args.length === 1 && isError(args[0])) {
        return args[0];
      }

      return applyFunction(f, args);
    }
    default: {
      console.log(node);
      throw new Error("cannot evaluate" + ": " + node?.toString());
    }
  }
}

function evaluateProgram(
  statements: ast.Statement[],
  env: Environment,
): object.ProgramObject {
  let result: object.ProgramObject;

  for (const statement of statements) {
    result = evaluate(statement, env);
    if (result instanceof object.ReturnValue) {
      return result.value;
    } else if (result instanceof object.ProgramError) {
      return result;
    }
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
      return object.ProgramError.from(
        `unknown operator: ${operator}${right.type()}`,
      );
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
    return object.ProgramError.from(`unknown operator: -${right.type()}`);
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
    case left.type() !== right.type(): {
      return object.ProgramError.from(
        `type mismatch: ${left.type()} ${operator} ${right.type()}`,
      );
    }
    default: {
      return object.ProgramError.from(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`,
      );
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
      return object.ProgramError.from(
        `unknown operator: ${left.type()} ${operator} ${right.type()}`,
      );
    }
  }
}

function translateBool(b: boolean): object.Boolean {
  if (b) return TRUE;

  return FALSE;
}

function evaluateIfExpression(expr: ast.IfExpression, env: Environment) {
  const condition = evaluate(expr.condition!, env);
  if (isError(condition)) return condition;

  if (isTruthy(condition)) {
    return evaluate(expr.consequence!, env);
  } else if (expr.alternative) {
    return evaluate(expr.alternative, env);
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

function evaluateBlockStatement(
  block: ast.BlockStatement,
  env: Environment,
): object.ProgramObject {
  let result: object.ProgramObject;

  for (const statement of block.statements) {
    result = evaluate(statement, env);

    if (
      result?.type() === object.OBJECT_TYPES.RETURN_VALUE_OBJECT ||
      result?.type() === object.OBJECT_TYPES.ERROR_OBJECT
    ) {
      return result;
    }
  }
  return result!;
}

function evaluateIdentifier(
  node: ast.Identifier,
  env: Environment,
): object.ProgramObject {
  const value = env.get(node.value);

  if (!value) {
    return object.ProgramError.from(`identifier not found: ${node.value}`);
  }

  return value;
}

function evaluateExpressions(
  exps: ast.Expression[],
  env: Environment,
): object.ProgramObject[] {
  const result: object.ProgramObject[] = [];

  for (const expression of exps) {
    const evaluated = evaluate(expression, env);
    if (isError(evaluated)) return [evaluated];

    result.push(evaluated);
  }

  return result;
}

function applyFunction(fn: object.ProgramObject, args: object.ProgramObject[]) {
  if (!(fn instanceof object.FunctionObject)) {
    return object.ProgramError.from(`not a function: ${fn.type()}`);
  }

  const extendedEnv = extendFunctionEnv(fn, args);
  const evaluated = evaluate(fn.body, extendedEnv);

  return unwrapReturnValue(evaluated);
}

function extendFunctionEnv(
  fn: object.FunctionObject,
  args: object.ProgramObject[],
) {
  const env = Environment.fromOuter(fn.env);

  fn.parameters.forEach((param, i) => {
    env.set(param.value, args[i]);
  });

  return env;
}

function unwrapReturnValue(obj: object.ProgramObject) {
  if (obj instanceof object.ReturnValue) return obj.value;

  return obj;
}
