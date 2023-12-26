import { Token } from "../token/token.ts";

export interface Node {
  tokenLiteral(): string;
}

export interface Statement extends Node {
  statementNode(): void;
}

export interface Expression extends Node {
  expressionNode(): void;
}

/**
 * This is the root node for the ast our parser creates.
 */
export class Program implements Node {
  statements: Statement[] = [];

  tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }
}

export class Identifier implements Expression {
  token: Token;
  value: string;

  constructor(t: Token, v: string) {
    this.token = t;
    this.value = v;
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }
}

export class LetStatement implements Statement {
  token: Token;
  value!: Expression;
  name!: Identifier;

  constructor(t: Token) {
    this.token = t;
  }

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }
}
