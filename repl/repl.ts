import { evaluate } from "../evaluator/evaluator.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Environment } from "../object/environment.ts";
import { Parser } from "../parser/parser.ts";

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
  const env = Environment.from();

  async function write(input: string) {
    await w.ready;
    await w.write(encoder.encode(input));
  }

  await write(welcome);

  await write(prompt);

  for await (const chunk of reader) {
    const text = decoder.decode(chunk);
    if (text === "exit();\n") {
      Deno.exit();
    }

    const lexer = Lexer.from(text);
    const parser = Parser.from(lexer);
    const program = parser.parseProgram();

    if (parser.errors().length) {
      await printParserErors(write, parser.errors());
      await write(prompt);
      continue;
    }

    const evaluated = evaluate(program, env);

    if (evaluated) {
      await write(evaluated.inspect());
      await write("\n");
    }

    await write(prompt);
  }

  await w.ready;
  await w.close();
}

async function printParserErors(
  write: (s: string) => Promise<void>,
  errors: string[],
) {
  await write(monkeyPrompt);
  await write("Oops! We ran into some donkey business around here!\n");
  await write("parser errors:\n");

  for (const err of errors) {
    await write("\t" + err + "\n");
  }
}

// todo make donkey
const monkeyPrompt = `            __,__
   .--.  .-"     "-.  .--.
  / .. \\/  .-. .-.  \\/ .. \\
 | |  '|  /   Y   \\  |'  | |
 | \\   \\  \\ 0 | 0 /  /   / |
  \\ '- ,\\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\\ '-''
       |  \\._   _./  |
       \\   \\ '~' /   /
        '._ '-=-' _.'
           '-----'
`;
