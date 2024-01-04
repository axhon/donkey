import { assert } from "std/assert/mod.ts";
import { Identifier, LetStatement, Program } from "./ast.ts";

Deno.test("test toString()", () => {
  const program = Program.fromStatements([
    LetStatement.fromName(Identifier.from("myVar")).withValue(
      Identifier.from("anotherVar"),
    ),
  ]);

  assert(
    program.toString() === "let myVar = anotherVar;",
    `program.toString() returned the wrong value. got: ${program}`,
  );
});
