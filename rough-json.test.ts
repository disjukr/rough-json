import { assertEquals, assertThrows } from "jsr:@std/assert@^1.0.0";

import { InvalidJsonError, parseRoughly } from "./rough-json.ts";

Deno.test("parse primitive values", () => {
  assertEquals(parseRoughly("null"), { type: "null" });
  assertEquals(parseRoughly("true"), { type: "boolean", value: true });
  assertEquals(parseRoughly("false"), { type: "boolean", value: false });
  assertEquals(parseRoughly("-12.34e5"), { type: "number", text: "-12.34e5" });
});

Deno.test("parse string value and preserve token text", () => {
  assertEquals(parseRoughly('"hello"'), { type: "string", text: '"hello"' });
});

Deno.test("parse array with mixed values", () => {
  assertEquals(parseRoughly('[null, true, 12, "x"]'), {
    type: "array",
    items: [
      { type: "null" },
      { type: "boolean", value: true },
      { type: "number", text: "12" },
      { type: "string", text: '"x"' },
    ],
  });
});

Deno.test("parse object and keep key/value nodes", () => {
  assertEquals(parseRoughly('{"name":"Ada","active":true}'), {
    type: "object",
    items: [
      {
        key: { type: "string", text: '"name"' },
        value: { type: "string", text: '"Ada"' },
      },
      {
        key: { type: "string", text: '"active"' },
        value: { type: "boolean", value: true },
      },
    ],
  });
});

Deno.test("skip leading whitespace", () => {
  assertEquals(parseRoughly(" \n\t\rfalse"), { type: "boolean", value: false });
});

Deno.test("does not enforce end-of-input", () => {
  assertEquals(parseRoughly("true false"), { type: "boolean", value: true });
});

Deno.test("throw InvalidJsonError on malformed input", () => {
  assertThrows(() => parseRoughly(""), InvalidJsonError);
  assertThrows(() => parseRoughly("tru"), InvalidJsonError);
  assertThrows(() => parseRoughly('{"a" 1}'), InvalidJsonError);
});
