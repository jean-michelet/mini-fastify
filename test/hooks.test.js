import { describe, it, beforeEach } from "node:test";

import miniFastify from "../mini-fastify.js";
import assert from "assert";

describe("miniFastify hooks", () => {
  /** @type {import('../mini-fastify.js').MiniFastifyInstance} */
  let app;
  beforeEach(() => {
    app = miniFastify();
  });

  it("should fail on invalid hook", async (t) => {
    try {
      app.addHook("notRealHook", async () => {});
      await app.ready();
      t.assert.fail();
    } catch (err) {
      t.assert.strictEqual(err.code, "FST_ERR_HOOK_NOT_SUPPORTED");
      t.assert.match(err.message, /hook not supported/i);
    }
  });

  it("should fail adding hook if app is started", async (t) => {
    await app.ready();
    try {
      app.addHook("onRequest", async () => {});
      t.assert.fail();
    } catch (err) {
      t.assert.strictEqual(err.code, "FST_ERR_INSTANCE_ALREADY_STARTED");
      t.assert.match(
        err.message,
        /Fastify instance is already started. Cannot call "addHook"!/i
      );
    }
  });

  async function assertRunSequentially({ name, onAdded, reverse = false }) {
    const given = [];
    app.addHook(name, async () => {
      given.push(1);
    });

    app.addHook(name, async () => {
      given.push(2);
    });

    app.addHook(name, async () => {
      given.push(3);
    });

    await onAdded();
    assert.deepStrictEqual(given, reverse ? [3, 2, 1] : [1, 2, 3]);
  }

  it("should execute onClose hooks sequentially", async () => {
    await assertRunSequentially({
      name: "onClose",
      onAdded: async () => {
        await app.ready();
        await app.close();
      },
      reverse: true,
    });
  });

  it("should execute application onReady hooks sequentially", async () => {
    await assertRunSequentially({
      name: "onReady",
      onAdded: async () => {
        await app.ready();
      },
    });
  });

  it("should execute application onRoute hooks sequentially", async () => {
    await assertRunSequentially({
      name: "onRoute",
      onAdded: async () => {
        app.route({
          method: "GET",
          url: "/",
          handler: () => {}
        })
        await app.ready();
      },
    });
  });

  it("should execute life cycle hooks sequentially", async () => {
    await assertRunSequentially({
      name: "onRequest",
      onAdded: async () => {
        app.route({
          method: "GET",
          url: "/ping",
          handler: (_, res) => {
            res.end();
          },
        });
        await app.ready();
        await app.inject({ method: "GET", url: "/ping" });
      },
    });
  });
});
