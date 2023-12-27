import { Identifier, LetStatement, Program } from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { type Token, TokenType } from "../token/token.ts";

export class Parser {
  lexer: Lexer;
  currentToken: Token;
  peekToken: Token;
  #errors: string[] = [];

  static create = create;

  constructor(l: Lexer) {
    this.lexer = l;

    this.currentToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();
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

      default:
        return null;
    }
  }

  parseLetStatement() {
    const statement = new LetStatement(this.currentToken);

    if (!this.expectPeek("IDENT")) {
      return null;
    }

    statement.name = new Identifier(
      this.currentToken,
      this.currentToken.literal,
    );

    if (!this.expectPeek("ASSIGN")) {
      return null;
    }

    // skip until semicolon
    while (!this.isCurrentToken("SEMICOLON")) {
      this.nextToken();
    }

    return statement;
  }

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

export function create(l: Lexer) {
  return new Parser(l);
}
