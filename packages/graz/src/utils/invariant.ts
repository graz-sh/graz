// https://github.com/alexreardon/tiny-invariant/blob/master/src/tiny-invariant.ts
// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions
export function invariant(condition: any, message?: string | (() => string)): asserts condition {
  if (condition) return;
  if (process.env.NODE_ENV === "production") throw new Error(prefix);
  const provided = typeof message === "function" ? message() : message;
  const value = provided ? `${prefix}: ${provided}` : prefix;
  throw new Error(value);
}

const prefix = "Invariant failed";
