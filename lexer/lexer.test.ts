import { assert } from "std/assert/mod.ts";
import { TokenType } from "../token.ts";
import { Lexer } from "./lexer.ts";

Deno.test("lexer.nextToken()", async (t) => {
  const input = "=+(){},;";
  const tests: { expectedType: TokenType; expectedLiteral: string }[] = [
    { expectedType: "ASSIGN", expectedLiteral: "=" },
    { expectedType: "PLUS", expectedLiteral: "+" },
    { expectedType: "LPAREN", expectedLiteral: "(" },
    { expectedType: "RPAREN", expectedLiteral: ")" },
    { expectedType: "LBRACE", expectedLiteral: "{" },
    { expectedType: "RBRACE", expectedLiteral: "}" },
    { expectedType: "COMMA", expectedLiteral: "," },
    { expectedType: "SEMICOLON", expectedLiteral: ";" },
    { expectedType: "EOF", expectedLiteral: "" },
  ];

  const lexer = new Lexer(input);

  for (const test of tests) {
    const token = lexer.nextToken();

    await t.step(test.expectedLiteral, () => {
      assert(test.expectedType === token.type);
      assert(test.expectedLiteral === token.literal);
    });
  }
});

Deno.test("monkey language assignment", async (t) => {
  const input = `let five = 5;
let ten = 10;

let add = fn(x, y) {
  x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 15;

if (5 < 10) {
  return true;
} else {
  return false;
}

10 == 10;
10 != 9;
`;

  const lexer = new Lexer(input);

  const expectations = [
    { type: "LET", literal: "let" },
    { type: "IDENT", literal: "five" },
    { type: "ASSIGN", literal: "=" },
    { type: "INT", literal: "5" },
    { type: "SEMICOLON", literal: ";" },
    { type: "LET", literal: "let" },
    { type: "IDENT", literal: "ten" },
    { type: "ASSIGN", literal: "=" },
    { type: "INT", literal: "10" },
    { type: "SEMICOLON", literal: ";" },
    { type: "LET", literal: "let" },
    { type: "IDENT", literal: "add" },
    { type: "ASSIGN", literal: "=" },
    { type: "FUNCTION", literal: "fn" },
    { type: "LPAREN", literal: "(" },
    { type: "IDENT", literal: "x" },
    { type: "COMMA", literal: "," },
    { type: "IDENT", literal: "y" },
    { type: "RPAREN", literal: ")" },
    { type: "LBRACE", literal: "{" },
    { type: "IDENT", literal: "x" },
    { type: "PLUS", literal: "+" },
    { type: "IDENT", literal: "y" },
    { type: "SEMICOLON", literal: ";" },
    { type: "RBRACE", literal: "}" },
    { type: "SEMICOLON", literal: ";" },
    { type: "LET", literal: "let" },
    { type: "IDENT", literal: "result" },
    { type: "ASSIGN", literal: "=" },
    { type: "IDENT", literal: "add" },
    { type: "LPAREN", literal: "(" },
    { type: "IDENT", literal: "five" },
    { type: "COMMA", literal: "," },
    { type: "IDENT", literal: "ten" },
    { type: "RPAREN", literal: ")" },
    { type: "SEMICOLON", literal: ";" },
    { type: "BANG", literal: "!" },
    { type: "MINUS", literal: "-" },
    { type: "SLASH", literal: "/" },
    { type: "ASTERISK", literal: "*" },
    { type: "INT", literal: "5" },
    { type: "SEMICOLON", literal: ";" },
    { type: "INT", literal: "5" },
    { type: "LT", literal: "<" },
    { type: "INT", literal: "10" },
    { type: "GT", literal: ">" },
    { type: "INT", literal: "15" },
    { type: "SEMICOLON", literal: ";" },
    { type: "IF", literal: "if" },
    { type: "LPAREN", literal: "(" },
    { type: "INT", literal: "5" },
    { type: "LT", literal: "<" },
    { type: "INT", literal: "10" },
    { type: "RPAREN", literal: ")" },
    { type: "LBRACE", literal: "{" },
    { type: "RETURN", literal: "return" },
    { type: "TRUE", literal: "true" },
    { type: "SEMICOLON", literal: ";" },
    { type: "RBRACE", literal: "}" },
    { type: "ELSE", literal: "else" },
    { type: "LBRACE", literal: "{" },
    { type: "RETURN", literal: "return" },
    { type: "FALSE", literal: "false" },
    { type: "SEMICOLON", literal: ";" },
    { type: "RBRACE", literal: "}" },
    { type: "INT", literal: "10" },
    { type: "EQ", literal: "==" },
    { type: "INT", literal: "10" },
    { type: "SEMICOLON", literal: ";" },
    { type: "INT", literal: "10" },
    { type: "NOT_EQ", literal: "!=" },
    { type: "INT", literal: "9" },
    { type: "SEMICOLON", literal: ";" },
  ];

  for (const expectation of expectations) {
    const currentToken = lexer.nextToken();
    await t.step(expectation.literal, () => {
      assert(expectation.type === currentToken.type);
      assert(expectation.literal === currentToken.literal);
    });
  }
});
