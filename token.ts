export const TOKEN_TYPES = {
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",
  // Identifiers + literals
  IDENT: "IDENT", // add, foobar, x, y, ...
  INT: "INT", // 1343456

  // Operators
  ASSIGN: "=",
  PLUS: "+",

  // Delimiters
  COMMA: ",",
  SEMICOLON: ";",

  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",

  // Keywords
  FUNCTION: "FUNCTION",
  LET: "LET",
} as const;

export type TokenType = keyof typeof TOKEN_TYPES;

export type Token = {
  type: TokenType;
  literal: string;
};

export function getTypeFromInput(input: string): TokenType {
  if (input === "") {
    return "EOF";
  }

  return "ILLEGAL";
}

export function makeToken(input: string): Token {
  return {
    literal: input,
    type: getTypeFromInput(input),
  };
}
