export const OBJECT_TYPES = {
  INTEGER_OBJECT: "INTEGER",
  BOOLEAN_OBJECT: "BOOLEAN",
  NULL_OBJECT: "NULL",
  RETURN_VALUE_OBJECT: "RETURN_VALUE",
  ERROR_OBJECT: "ERROR",
} as const;

type ProgramObjectType = (typeof OBJECT_TYPES)[keyof typeof OBJECT_TYPES];

export interface ProgramObject {
  type(): ProgramObjectType;
  inspect(): string;
}

export class Integer implements ProgramObject {
  value;

  static from(val: number) {
    return new Integer(val);
  }

  constructor(val: number) {
    this.value = val;
  }

  inspect(): string {
    return this.value.toString();
  }

  type(): ProgramObjectType {
    return OBJECT_TYPES.INTEGER_OBJECT;
  }
}

export class Boolean implements ProgramObject {
  value;

  static from(val: boolean) {
    return new Boolean(val);
  }

  constructor(val: boolean) {
    this.value = val;
  }

  inspect(): string {
    return this.value.toString();
  }

  type(): ProgramObjectType {
    return OBJECT_TYPES.BOOLEAN_OBJECT;
  }
}

export class Null implements ProgramObject {
  static from() {
    return new Null();
  }

  inspect(): string {
    return "null";
  }

  type(): ProgramObjectType {
    return OBJECT_TYPES.NULL_OBJECT;
  }
}

export class ReturnValue implements ProgramObject {
  value;

  static from(val: ProgramObject) {
    return new ReturnValue(val);
  }

  constructor(val: ProgramObject) {
    this.value = val;
  }

  inspect(): string {
    return this.value.inspect();
  }
  type() {
    return OBJECT_TYPES.RETURN_VALUE_OBJECT;
  }
}

export class ProgramError implements ProgramObject {
  message;

  static from(msg: string) {
    return new ProgramError(msg);
  }

  constructor(msg: string) {
    this.message = msg;
  }

  inspect(): string {
    return `ERROR: ${this.message}`;
  }

  type() {
    return OBJECT_TYPES.ERROR_OBJECT;
  }
}
