import {
  Expression,
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  LetStatement,
  Program,
  ReturnStatement,
} from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { type Token, TokenType } from "../token/token.ts";

type prefixParseFn = () => Expression;
type infixParseFn = (e: Expression) => Expression;

export const PRECENDENCE = {
  LOWEST: 1,
  EQUALS: 2, // ==
  LESSGREATER: 3, // < or >
  SUM: 4, // +
  PRODUCT: 5, // *
  PREFIX: 6, // -X or !X
  CALL: 7, // myFunc(X)
} as const;

export type PrecedenceKey = keyof typeof PRECENDENCE;
export type Precedence = (typeof PRECENDENCE)[PrecedenceKey];

export class Parser {
  lexer: Lexer;
  currentToken: Token;
  peekToken: Token;
  #errors: string[] = [];

  prefixParseFns = new Map<TokenType, prefixParseFn>();
  infixParseFns = new Map<TokenType, infixParseFn>();

  static from(l: Lexer) {
    return new Parser(l);
  }

  constructor(l: Lexer) {
    this.lexer = l;

    this.currentToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();

    this.registerPrefix("IDENT", this.parseIdentifier);
    this.registerPrefix("INT", this.parseIntegerLiteral);
  }

  registerPrefix(t: TokenType, f: prefixParseFn) {
    this.prefixParseFns.set(t, f);
  }

  registerInfix(t: TokenType, f: infixParseFn) {
    this.infixParseFns.set(t, f);
  }

  errors() {
    return this.#errors;
  }

  peekError(t: TokenType) {
    this.#errors.push(
      `Expected value to be: ${t} but got: ${this.peekToken.type} instead`,
    );
  }

  nextToken() {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): Program {
    const program = new Program();

    while (!this.isCurrentToken("EOF")) {
      const statement = this.parseStatement();

      if (statement !== null) {
        program.statements.push(statement);
      }

      this.nextToken();
    }

    return program;
  }

  parseStatement() {
    switch (this.currentToken.type) {
      case "LET":
        return this.parseLetStatement();
      case "RETURN":
        return this.parseReturnStatement();

      default:
        return this.parseExpressionStatement();
    }
  }

  parseLetStatement() {
    const statement = new LetStatement();

    if (!this.expectPeek("IDENT")) {
      return null;
    }

    statement.withName(Identifier.from(this.currentToken.literal));

    if (!this.expectPeek("ASSIGN")) {
      return null;
    }

    // skip until semicolon
    while (!this.isCurrentToken("SEMICOLON")) {
      this.nextToken();
    }

    return statement;
  }

  parseReturnStatement() {
    const statement = new ReturnStatement();

    this.nextToken();

    // skip until we find a semicolon
    while (!this.isCurrentToken("SEMICOLON")) {
      this.nextToken();
    }

    return statement;
  }

  parseExpressionStatement(): ExpressionStatement {
    const statement = ExpressionStatement.from(this.currentToken);
    statement.expression = this.parseExpression(PRECENDENCE.LOWEST);

    if (this.isPeekToken("SEMICOLON")) {
      this.nextToken();
    }

    return statement;
  }

  parseExpression(p: Precedence) {
    const prefix = this.prefixParseFns.get(this.currentToken.type);

    if (prefix === undefined) {
      return null;
    }

    const leftExpression = prefix();

    return leftExpression;
  }

  parseIdentifier = (): Expression => {
    return Identifier.from(this.currentToken.literal);
  };

  parseIntegerLiteral = (): Expression => {
    try {
      const value = parseInt(this.currentToken.literal, 10);

      if (Number.isNaN(value)) {
        throw Error(`failed to parse value: ${value}`);
      }

      return IntegerLiteral.from(this.currentToken.literal, value);
    } catch {
      this.#errors.push(
        `could not parse ${this.currentToken.literal} as number`,
      );

      return IntegerLiteral.from(this.currentToken.literal);
    }
  };

  expectPeek(t: TokenType): boolean {
    if (this.isPeekToken(t)) {
      this.nextToken();
      return true;
    }

    this.peekError(t);
    return false;
  }

  isPeekToken(t: TokenType): boolean {
    return this.peekToken.type === t;
  }

  isCurrentToken(t: TokenType): boolean {
    return this.currentToken.type === t;
  }
}
