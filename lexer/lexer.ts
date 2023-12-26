import {
  lookupIDENT,
  makeToken,
  Token,
  TOKEN_TYPES,
  type TokenType,
} from "../token/token.ts";

export class Lexer {
  #input: string;
  #position = 0;
  #readPosition = 0;
  #character: string | 0 = 0;

  static create = create;

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

  #peekChar() {
    if (this.#readPosition >= this.#input.length) {
      return 0;
    } else {
      return this.#input[this.#readPosition];
    }
  }

  nextToken(): Token {
    this.#eatWhitespace();

    let t: Token;
    switch (this.#character) {
      case "=": {
        if (this.#peekChar() === "=") {
          t = {
            literal: "==",
            type: "EQ",
          };
          this.#readChar();
        } else {
          t = this.#makeTokenForCharacter("ASSIGN");
        }
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

      case "-": {
        t = this.#makeTokenForCharacter("MINUS");
        break;
      }

      case "*": {
        t = this.#makeTokenForCharacter("ASTERISK");
        break;
      }

      case "/": {
        t = this.#makeTokenForCharacter("SLASH");
        break;
      }

      case "<": {
        t = this.#makeTokenForCharacter("LT");
        break;
      }

      case ">": {
        t = this.#makeTokenForCharacter("GT");
        break;
      }

      case "!": {
        if (this.#peekChar() === "=") {
          t = {
            literal: "!=",
            type: "NOT_EQ",
          };
          this.#readChar();
        } else {
          t = this.#makeTokenForCharacter("BANG");
        }
        break;
      }

      case 0: {
        t = this.#makeTokenForCharacter("EOF");
        break;
      }

      default: {
        if (isLetter(this.#character)) {
          const literal = this.#readIdentifier();
          const type = lookupIDENT(literal);
          t = {
            type,
            literal,
          };
          return t;
        } else if (isDigit(this.#character)) {
          const type = TOKEN_TYPES.INT;
          const literal = this.#readNumber();
          t = {
            type,
            literal,
          };

          return t;
        } else {
          t = this.#makeTokenForCharacter("ILLEGAL");
          break;
        }
      }
    }

    this.#readChar();
    return t;
  }

  #readIdentifier(): string {
    const startPosition = this.#position;
    while (isLetter(this.#character || "")) {
      this.#readChar();
    }

    return this.#input.slice(startPosition, this.#position);
  }

  #readNumber(): string {
    const startPosition = this.#position;
    while (isDigit(this.#character || "")) {
      this.#readChar();
    }

    return this.#input.slice(startPosition, this.#position);
  }

  #makeTokenForCharacter(tt: TokenType) {
    return makeToken(tt, this.#character !== 0 ? this.#character : "");
  }

  #eatWhitespace() {
    while ([" ", "\t", "\n", "\r"].includes(this.#character || "")) {
      this.#readChar();
    }
  }
}

function isLetter(ch: string): boolean {
  return /[a-z_]/i.test(ch);
}

function isDigit(ch: string): boolean {
  return /\d/.test(ch);
}

export function create(input: string) {
  return new Lexer(input);
}
