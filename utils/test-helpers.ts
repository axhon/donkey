export function makeInputs<Value = unknown>(inputs: [string, Value][]) {
  return inputs.map(([input, expected]) => ({ input, expected }));
}
