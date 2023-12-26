import { Program } from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { type Token } from "../token/token.ts";

export class Parser {
  lexer: Lexer;
  currentToken: Token;
  peekToken: Token;

  static makeParser = makeParser;

  constructor(l: Lexer) {
    this.lexer = l;

    this.currentToken = this.lexer.nextToken();
    this.peekToken = this.lexer.nextToken();
  }

  nextToken() {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): Program {
    return new Program();
  }
}

export function makeParser(l: Lexer) {
  return new Parser(l);
}