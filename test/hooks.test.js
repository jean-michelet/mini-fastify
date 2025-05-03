import { describe, it, beforeEach } from "node:test";

import miniFastify from "../mini-fastify.js";

describe("miniFastify hooks", () => {
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
      t.assert.match(err.message, /Fastify instance is already started. Cannot call "addHook"!/i);
    }
  });

  it("should execute hooks sequentially", async (t) => {
    t.plan(2);
    const given = [];
    app.addHook("onRequest", () => {
      given.push(1);
    });
    app.addHook("onRequest", async () => {
      given.push(2);
    });
    app.addHook("onRequest", () => {
      given.push(3);
    });
    app.route({
      method: "GET",
      url: "/ping",
      handler: (_, res) => {
        res.end("he");
      },
    });

    const res = await app.inject({ method: "GET", url: "/ping" });
    t.assert.equal(res.statusCode, 200);
    t.assert.deepStrictEqual(given, [1, 2, 3]);
  });
});
