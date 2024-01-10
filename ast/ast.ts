import { makeToken, Token } from "../token/token.ts";

type Nullable<T> = T | null;

export interface Node {
  tokenLiteral(): string;
  toString(): string;
}

export interface Statement extends Node {}

export interface Expression extends Node {}

/**
 * This is the root node for the ast our parser creates.
 */
export class Program implements Node {
  statements: Statement[] = [];

  static fromStatements(s: Statement[]) {
    return new Program().withStatements(s);
  }

  withStatement(s: Statement) {
    this.statements.push(s);
    return this;
  }

  withStatements(s: Statement[]) {
    for (const statement of s) {
      this.statements.push(statement);
    }

    return this;
  }

  tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }

  toString(): string {
    let out = "";

    for (const statement of this.statements) {
      out += statement;
    }

    return out;
  }
}

export class Identifier implements Expression {
  token: Token;
  value: string;

  static from(v: string) {
    return new Identifier(v);
  }

  constructor(v: string) {
    this.token = makeToken("IDENT", v);
    this.value = v;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.value}`;
  }
}

export class LetStatement implements Statement {
  token = makeToken("LET", "let");
  value: Nullable<Expression> = null;
  name: Nullable<Identifier> = null;

  static fromName(n: Identifier) {
    return new LetStatement().withName(n);
  }

  withValue(e: Expression): this {
    this.value = e;
    return this;
  }

  withName(n: Identifier): this {
    this.name = n;
    return this;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} ${this.name ?? ""} = ${this.value ?? ""};`;
  }
}

export class ReturnStatement implements Statement {
  token = makeToken("RETURN", "return");
  returnValue: Nullable<Expression> = null;

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.tokenLiteral()} ${this.returnValue ?? ""};`;
  }
}

export class ExpressionStatement implements Statement {
  token: Token;
  expression: Nullable<Expression> = null;

  constructor(t: Token) {
    this.token = t;
  }

  static from(t: Token) {
    return new ExpressionStatement(t);
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `${this.expression ?? ""}`;
  }
}

export class IntegerLiteral implements Expression {
  token;
  value;

  constructor(literal: string, value?: number) {
    this.token = makeToken("INT", literal);
    this.value = value;
  }

  static from(literal: string, value?: number) {
    return new IntegerLiteral(literal, value);
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return this.token.literal;
  }
}

export class PrefixExpression implements Expression {
  token;
  operator;
  right: Nullable<Expression> = null;

  constructor(token: Token, operator: string) {
    this.token = token;
    this.operator = operator;
  }

  static from(token: Token, operator: string) {
    return new PrefixExpression(token, operator);
  }

  withRight(e: Expression | null): this {
    this.right = e;
    return this;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  toString(): string {
    return `(${this.operator}${this.right})`;
  }
}
