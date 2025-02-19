import * as object from "./object.ts";

export class Environment {
  #store;
  #outer;

  static fromOuter(env: Environment) {
    return Environment.from().withOuter(env);
  }
  static from(str = new Map<string, object.ProgramObject>()) {
    return new Environment(str);
  }

  constructor(str: Map<string, object.ProgramObject>, outer?: Environment) {
    this.#store = str;
    this.#outer = outer;
  }

  get(name: string): object.ProgramObject | undefined {
    const inner = this.#store.get(name);

    if (!inner && this.#outer) {
      return this.#outer.get(name);
    }

    return inner;
  }

  set(name: string, value: object.ProgramObject) {
    this.#store.set(name, value);
    return value;
  }

  withOuter(env: Environment) {
    this.#outer = env;
    return this;
  }
}
