import { makeToken, Token, TokenType } from "../token.ts";

export class Lexer {
  #input: string;
  #position = 0;
  #readPosition = 0;
  #character: string | 0 = 0;

  constructor(input: string) {
    this.#input = input;

    this.#readChar();
  }

  #readChar() {
    if (this.#readPosition >= this.#input.length) {
      this.#character = 0;
    } else {
      this.#character = this.#input[this.#readPosition];
    }

    this.#position = this.#readPosition;
    this.#readPosition++;
  }

  nextToken(): Token {
    let t: Token;
    switch (this.#character) {
      case "=": {
        t = this.#makeTokenForCharacter("ASSIGN");
        break;
      }
      case ";": {
        t = this.#makeTokenForCharacter("SEMICOLON");
        break;
      }

      case "(": {
        t = this.#makeTokenForCharacter("LPAREN");
        break;
      }

      case ")": {
        t = this.#makeTokenForCharacter("RPAREN");
        break;
      }

      case "{": {
        t = this.#makeTokenForCharacter("LBRACE");
        break;
      }

      case "}": {
        t = this.#makeTokenForCharacter("RBRACE");
        break;
      }

      case ",": {
        t = this.#makeTokenForCharacter("COMMA");
        break;
      }

      case "+": {
        t = this.#makeTokenForCharacter("PLUS");
        break;
      }

      case 0: {
        t = this.#makeTokenForCharacter("EOF");
        break;
      }

      default: {
        t = this.#makeTokenForCharacter("ILLEGAL");
        break;
      }
    }

    this.#readChar();
    return t;
  }

  #makeTokenForCharacter(tt: TokenType) {
    return makeToken(tt, this.#character !== 0 ? this.#character : "");
  }
}
