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

    assert.strictEqual(state.booting, false);
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
    assert.strictEqual(state.booting, false);
    assert.strictEqual(state.started, true);
    assert.strictEqual(state.ready, true);
    assert.strictEqual(state.closing, false);
    assert.strictEqual(state.readyPromise, null);
  });

  it("ready should be indempotant", async () => {
    assert.deepStrictEqual(app.ready(), app.ready())
  });

  it("should trigger an Avvio timeout error during boot", async () => {
    app = miniFastify({
      pluginTimeout: 50
    });
  
    // eslint-disable-next-line no-unused-vars
    app.register((_instance, _opts, _done) => {
      // done() is never called – throw on timeout
    });

    try {
      await app.ready();
      assert.fail("Expected timeout error");
    } catch (err) {
      // Fastify wraps Avvio error codes
      assert.strictEqual(err.code, "FST_ERR_PLUGIN_TIMEOUT");
    }
  });

  it("should update state once the application is closed", async () => {
    await app.ready();
    await app.close();

    const state = app[kState];
    assert.strictEqual(state.booting, false);
    assert.strictEqual(state.started, true);
    assert.strictEqual(state.ready, true);
    assert.strictEqual(state.closing, true);
    assert.strictEqual(state.readyPromise, null);
  });

  it("should allow custom onClose handlers", async () => {
    let x = 0;
    app.onClose(async () => x++).onClose(async () => x++);

    await app.ready();
    await app.close();

    assert.strictEqual(x, 2);
  });
});
