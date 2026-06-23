type PlainObject = Record<string | symbol, any>;

type ResolverFn = (
  baseVal: any,
  patchVal: any,
  opts: MergeOptions
) => any;

export interface MergeOptions {
  resolvers?: Record<string | symbol, ResolverFn>;
  strict?: boolean;
  clone?: boolean;
}

export function _mergeoptions(
  base: PlainObject,
  patch: PlainObject,
  opts: MergeOptions = {}
): PlainObject {
  // ── Config ──────────────────────────────────────────────────────

  const resolvers = opts.resolvers ?? {};
  const strict = opts.strict ?? false;
  const clone = opts.clone !== false;

  // ── Helpers ─────────────────────────────────────────────────────

  function isPlainObject(val: any): val is PlainObject {
    if (val === null || typeof val !== "object") return false;
    const proto = Object.getPrototypeOf(val);
    return proto === Object.prototype || proto === null;
  }

  function ownKeys(obj: object): (string | symbol)[] {
    const keys: (string | symbol)[] = Object.keys(obj);

    if (Object.getOwnPropertySymbols) {
      for (const sym of Object.getOwnPropertySymbols(obj)) {
        if (Object.prototype.propertyIsEnumerable.call(obj, sym)) {
          keys.push(sym);
        }
      }
    }

    return keys;
  }

  function isProtected(target: any, key: string | symbol): boolean {
    try {
      return (
        key in target &&
        !(
          Object.hasOwn(target, key) &&
          Object.prototype.propertyIsEnumerable.call(target, key)
        )
      );
    } catch {
      return false;
    }
  }

  // ── Recursive ───────────────────────────────────────────────────

  function fuse(
    a: PlainObject,
    b: PlainObject,
    seen: WeakSet<object>
  ): PlainObject {
    if (seen.has(b)) {
      if (strict) {
        throw new TypeError(
          "_mergeoptions: referencia circular detectada."
        );
      }
      return b;
    }

    seen.add(b);

    const result: PlainObject = {};

    if (isPlainObject(a)) {
      for (const key of ownKeys(a)) {
        result[key] = maybeClone(a[key], seen);
      }
    }

    for (const key of ownKeys(b)) {
      if (isProtected(a, key)) continue;

      const resolver = resolvers[key as string];
      if (resolver) {
        result[key] = resolver(a?.[key as string], b[key], opts);
        continue;
      }

      if (isPlainObject(a?.[key as string]) && isPlainObject(b[key])) {
        result[key] = fuse(
          a[key as string],
          b[key],
          seen
        );
        continue;
      }

      result[key] = maybeClone(b[key], seen);
    }

    return result;
  }

  function maybeClone(val: any, seen: WeakSet<object>): any {
    if (!clone || !isPlainObject(val)) return val;
    return fuse({}, val, seen);
  }

  // ── Validation ──────────────────────────────────────────────────

  if (!isPlainObject(base) || !isPlainObject(patch)) {
    throw new TypeError(
      "_mergeoptions: base y patch deben ser objetos planos."
    );
  }

  return fuse(base, patch, new WeakSet<object>());
}