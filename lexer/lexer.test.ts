import { assert } from "std/assert/mod.ts";
import { Token, TokenType } from "../token.ts";
import { Lexer } from "./lexer.ts";

Deno.test("lexer.nextToken()", (t) => {
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
    { expectedType: "EOF", expectedLiteral: ";" },
  ];

  const lexer = new Lexer(input);

  for (const test of tests) {
    const token = lexer.nextToken();

    t.step(test.expectedLiteral, () => {
      assert(test.expectedType === token.type);
      assert(test.expectedLiteral === token.literal);
    });
  }
});
