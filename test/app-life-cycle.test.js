import { it, describe, beforeEach } from "node:test";
import assert from "node:assert";
import miniFastify from "../mini-fastify.js";
import { kState } from "../lib/symbols.js";

describe("miniFastify lifecycle", () => {
  let app;

  beforeEach(() => {
    app = miniFastify();
  });

  it("should create instance with expected default properties", () => {
    const state = app[kState];

    assert.strictEqual(state.started, false);
    assert.strictEqual(state.ready, false);
    assert.strictEqual(state.closing, false);
    assert.strictEqual(state.readyPromise, null);

    assert.strictEqual(typeof app.register, "function");
    assert.strictEqual(typeof app.ready, "function");
    assert.strictEqual(typeof app.onClose, "function");
    assert.strictEqual(typeof app.close, "function");
  });

  it("should update state once the application is ready", async () => {
    await app.ready();

    const state = app[kState];

    assert.strictEqual(state.started, true);
    assert.strictEqual(state.ready, true);
    assert.strictEqual(state.closing, false);
    assert.ok(state.readyPromise instanceof Promise);
  });

  it("should keep state consistent if ready is called multiple times", async () => {
    await app.ready();
    assertState()

    await app.ready();
    assertState()

    function assertState() {
      const state = app[kState];
      assert.strictEqual(state.started, true);
      assert.strictEqual(state.ready, true);
      assert.strictEqual(state.closing, false);
      assert.ok(state.readyPromise instanceof Promise);
    }
  });

  it("should update state once the application is closed", async () => {
    await app.ready();
    await app.close();

    const state = app[kState];

    assert.strictEqual(state.started, true);
    assert.strictEqual(state.ready, true);
    assert.strictEqual(state.closing, true);
    assert.ok(state.readyPromise instanceof Promise);
  });

  it("should allow custom onClose handlers", async () => {
    let x = 0;
    app.onClose(async () => x++).onClose(async () => x++);

    await app.ready();
    await app.close();

    assert.strictEqual(x, 2);
  });
});
