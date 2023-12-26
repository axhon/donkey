import { makeToken, TOKEN_TYPES } from "../token/token.ts";

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
  token = makeToken(TOKEN_TYPES.IDENT, "");
  value = "";

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }
}

export class LetStatement implements Statement {
  token = makeToken(TOKEN_TYPES.LET, "let");
  value: Expression;
  name: Identifier;

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }
}
