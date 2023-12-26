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

  EQ: "==",
  NOT_EQ: "!=",

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
  IF: "if",
  ELSE: "else",
  TRUE: "true",
  FALSE: "false",
  RETURN: "return",
} as const;

export const KEYWORDS = new Map<
  string,
  "FUNCTION" | "LET" | "IF" | "ELSE" | "TRUE" | "FALSE" | "RETURN"
>([
  [TOKEN_TYPES.LET, "LET"],
  [TOKEN_TYPES.FUNCTION, "FUNCTION"],
  [TOKEN_TYPES.IF, "IF"],
  [TOKEN_TYPES.ELSE, "ELSE"],
  [TOKEN_TYPES.TRUE, "TRUE"],
  [TOKEN_TYPES.FALSE, "FALSE"],
  [TOKEN_TYPES.RETURN, "RETURN"],
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

export function makeToken<T = TokenType, const I = string>(
  tokenType: T,
  input: I,
): { type: T; literal: I } {
  return {
    literal: input,
    type: tokenType,
  };
}
