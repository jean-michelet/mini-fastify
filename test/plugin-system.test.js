import { it, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

import miniFastify from "../mini-fastify.js";

describe("miniFastify plugin registration", () => {
  let app;

  beforeEach(() => {
    app = miniFastify();
  });

  afterEach(async () => {
    await app.close()
  })


  it("should reject if a plugin throws or fails during registration", async () => {
    const expectedError = new Error("Kaboom!");

    app.register(async () => {
      throw expectedError;
    });

    try {
      await app.ready();
      assert.fail();
    } catch (err) {
      assert.strictEqual(err, expectedError);
    }
  });

  it("should pass options to registered plugins", async () => {
    let receivedOpts;
    app.register(
      async (instance, opts) => {
        receivedOpts = opts;
      },
      { x: 1 }
    );

    await app.ready();

    assert.deepEqual(receivedOpts, { x: 1 });
  });

  it("should isolate plugin context via encapsulation", async () => {
    let childValue;
    app.register(async (instance) => {
      instance.x = 1;

      instance.register(async (child) => {
        childValue = child.x;
      });
    });

    await app.ready();

    assert.strictEqual(childValue, 1);
    assert.strictEqual(app.x, undefined);
  });

  it("should skip encapsulation if plugin sets Symbol.for('skip-override')", async () => {
    const plugin = async (instance) => {
      instance.x = 1;
    };
    plugin[Symbol.for("skip-override")] = true;

    app.register(plugin);
    app.register(async (instance) => {
      assert.strictEqual(instance.x, 1);
    });

    await app.ready();

    assert.strictEqual(app.x, 1);
  });

  it("should immediately decorate if awaited", async () => {
    const plugin = async (instance) => {
      instance.x = 1;
    };
    plugin[Symbol.for("skip-override")] = true;

    await app.register(plugin);

    assert.strictEqual(app.x, 1);

    await app.ready();
  });
});
