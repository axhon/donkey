import * as object from "./object.ts";

export class Environment {
  #store;

  static from(str = new Map<string, object.ProgramObject>()) {
    return new Environment(str);
  }

  constructor(str: Map<string, object.ProgramObject>) {
    this.#store = str;
  }

  get(name: string) {
    return this.#store.get(name);
  }

  set(name: string, value: object.ProgramObject) {
    this.#store.set(name, value);
    return value;
  }
}
