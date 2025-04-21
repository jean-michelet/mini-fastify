export function pluginOverride(old, fn) {
  // Non-encapsulated plugin → keep the same object (same reference)
  // Typically used for global decorators
  if (fn[Symbol.for("skip-override")]) {
    return old;
  }

  // Encapsulated plugin → create a shallow inheritance wrapper
  // This keeps any decorators or state local to that branch of the tree.
  return Object.create(old);
}
