import { Lexer } from "../lexer/lexer.ts";

const PROMPT = ">> " as const;
const WELCOME = `Welcome, and thank you for trying out the Donkey REPL!
The language this REPL targets in the monkey laguage described in the book \`Writing an Interpreter in Go\`
Use the command \`exit();\` or CTRL-D to exit the REPL.
` as const;

export async function start({
  reader = Deno.stdin.readable,
  writer = Deno.stdout.writable,
  decoder = new TextDecoder(),
  encoder = new TextEncoder(),
  prompt = PROMPT as string,
  welcome = WELCOME as string,
} = {}) {
  const w = writer.getWriter();

  async function write(input: string) {
    await w.ready;
    await w.write(encoder.encode(input));
  }

  async function writeJSON(input: unknown) {
    await w.ready;
    await w.write(encoder.encode(JSON.stringify(input, null, 2) + "\n"));
  }

  await write(welcome);

  await write(prompt);

  for await (const chunk of reader) {
    const text = decoder.decode(chunk);
    if (text === "exit();\n") {
      Deno.exit();
    }

    const lexer = new Lexer(text);

    let currentToken = lexer.nextToken();

    await writeJSON(currentToken);

    while (currentToken.type !== "EOF") {
      currentToken = lexer.nextToken();
      await writeJSON(currentToken);
    }

    await write(prompt);
  }

  await w.ready;
  await w.close();
}
