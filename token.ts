export const TOKEN_TYPES = {
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",
  // Identifiers + literals
  IDENT: "IDENT", // add, foobar, x, y, ...
  INT: "INT", // 1343456

  // Operators
  ASSIGN: "=",
  PLUS: "+",
  MINUS: "-",
  SLASH: "/",
  ASTERISK: "*",

  // Delimiters
  COMMA: ",",
  SEMICOLON: ";",

  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",
  LT: "<",
  GT: ">",
  BANG: "!",

  // Keywords
  FUNCTION: "fn",
  LET: "let",
} as const;

export const KEYWORDS = new Map<string, "FUNCTION" | "LET">([
  [TOKEN_TYPES.LET, "LET"],
  [TOKEN_TYPES.FUNCTION, "FUNCTION"],
]);

export type TokenType = keyof typeof TOKEN_TYPES;

export function lookupIDENT(identifier: string): TokenType {
  if (KEYWORDS.has(identifier)) {
    return KEYWORDS.get(identifier)!;
  }

  return TOKEN_TYPES.IDENT;
}

export type Token = {
  type: TokenType;
  literal: string;
};

export function makeToken(tokenType: TokenType, input: string): Token {
  return {
    literal: input,
    type: tokenType,
  };
}
