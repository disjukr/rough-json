# rough-json

A tiny TypeScript parser that reads JSON text and returns a _rough_ AST (`RoughJson`) instead of
fully decoded runtime values.

This project exists to avoid silent numeric incompatibility between runtimes. JSON specifies how a
number literal looks in text, but it does not require every runtime to materialize that literal into
the same in-memory numeric type. In JavaScript, `JSON.parse` maps numbers to `number` (IEEE 754
double), which can lose precision for large integers. Other compliant implementations may preserve
larger integer ranges, so preserving the original token text helps you choose decoding rules
explicitly when interoperability matters.

This is useful when you want to:

- keep the original token text for numbers/strings,
- preserve number lexemes first, then decode with runtime-specific precision rules,
- inspect value shapes without converting to plain objects,
- build custom tooling (formatters, analyzers, migration scripts).

## What you get

- `parseRoughly(text)` entry point
- typed AST node union (`RoughJson`)
- explicit node types for `null`, `boolean`, `number`, `string`, `array`, `object`
- a dedicated `InvalidJsonError` for parse failures

## Install

### npm

```bash
npm install rough-json
```

The npm package is published as compiled ESM JavaScript with declaration files:

- runtime: `dist/rough-json.js`
- types: `dist/rough-json.d.ts`

### Deno

Import directly from this repository file or your local copy:

```ts
import { parseRoughly } from "./rough-json.ts";
```

## Quick example

```ts
import { parseRoughly } from "rough-json";

const ast = parseRoughly('{"name":"Ada","active":true,"score":12.5}');

console.log(ast);
```

High-level shape of the result:

```ts
{
  type: "object",
  items: [
    {
      key: { type: "string", text: '"name"' },
      value: { type: "string", text: '"Ada"' }
    },
    {
      key: { type: "string", text: '"active"' },
      value: { type: "boolean", value: true }
    },
    {
      key: { type: "string", text: '"score"' },
      value: { type: "number", text: "12.5" }
    }
  ]
}
```

## API

### `parseRoughly(text: string): RoughJson`

Parses one JSON value at the current start position (after leading whitespace) and returns a typed
AST node.

Throws `InvalidJsonError` if parsing fails.

### Exported types

- `RoughJson`
- `RoughNull`
- `RoughBoolean`
- `RoughNumber`
- `RoughString`
- `RoughArray`
- `RoughObject`
- `RouthJsonKeyValue`

## AST reference

```ts
type RoughJson =
  | RoughNull
  | RoughBoolean
  | RoughNumber
  | RoughString
  | RoughArray
  | RoughObject;

interface RoughNull {
  type: "null";
}

interface RoughBoolean {
  type: "boolean";
  value: boolean;
}

interface RoughNumber {
  type: "number";
  text: string;
}

interface RoughString {
  type: "string";
  text: string;
}

interface RoughArray {
  type: "array";
  items: RoughJson[];
}

interface RoughObject {
  type: "object";
  items: RouthJsonKeyValue[];
}

interface RouthJsonKeyValue {
  key: RoughString;
  value: RoughJson;
}
```

## Scripts

From `package.json`:

- `npm run clean` -> remove `dist`
- `npm run build` -> compile `rough-json.ts` to `dist/*.js` and `dist/*.d.ts`
- `npm run typecheck` -> run TypeScript type-check without emit
- `npm run fmt` -> format source with Deno formatter
- `npm run lint` -> lint source with Deno linter
- `npm run check` -> run Deno check plus TypeScript type-check
- `npm run test` -> run Deno tests
- `npm run verify` -> run `fmt`, `lint`, `check`, `test`, `build` in sequence
- `npm run prepack` -> run full verification before npm packing/publishing

From `deno.json`:

- `deno task build`
- `deno task fmt`
- `deno task lint`
- `deno task check`
- `deno task test`
- `deno task verify`

## Current parser behavior and limitations

This parser is intentionally small and currently favors simplicity over strict JSON compliance.

- It parses a value from the beginning (after leading whitespace), but does not enforce end-of-input
  after that value.
- Number parsing is permissive (`-`, digits, `.`, `e`, `E`) and does not fully validate the complete
  JSON number grammar.
- `RoughNumber.text` keeps the exact source token so you can apply your own numeric decoding policy
  (for example, to align JavaScript with runtimes that preserve larger integer precision).
- String nodes keep raw token text; `text` includes surrounding quotes.
- Escape handling in strings is minimal.
- Object keys must be JSON strings.

If you need strict RFC-compliant parsing, use a strict JSON parser and treat this package as an
AST-oriented utility.

## Development

```bash
deno task verify
```

or

```bash
npm run verify
```
