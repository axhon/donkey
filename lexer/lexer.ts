import { Token, makeToken } from "../token.ts";

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
    this.#readPosition += 1;
  }

  nextToken(): Token {
    let t: Token;
    switch (this.#character) {
      case "=":
        t = { type: "ASSIGN", literal: "=" };
        break;
      case 0:
        t = { type: "EOF", literal: "" };
        break;
      default:
        t = { type: "ILLEGAL", literal: this.#character };
    }
    return t;
  }
}
