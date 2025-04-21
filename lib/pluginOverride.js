export function pluginOverride(old, fn) {
  // If the function has the `Symbol.for("skip-override")` property, return the original function.
  if (fn[Symbol.for("skip-override")]) {
    return old;
  }

  // Otherwise, create a new object that inherits from `old`, allowing for method extension.
  return Object.create(old);
}
