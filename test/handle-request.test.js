import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import miniFastify from "../mini-fastify.js";

describe("miniFastify handleRequest", () => {
  let app;

  beforeEach(() => {
    app = miniFastify();
  });

  it("should return a 500 error if handler throw", async () => {
    app.route({
      method: "GET",
      url: "/ping",
      handler: () => {
        throw new Error("Kaboom!");
      },
    });

    const res = await app.inject({ method: "GET", url: "/ping" });
    assert.equal(res.statusCode, 500);
    assert.strictEqual(JSON.parse(res.body).error, "Kaboom!");
  });

  it("should return a 500 error if a lyfe cycle hook throw", async () => {
    app.addHook("onRequest", () => {
      throw new Error("Kaboom!");
    });
    app.route({
      method: "GET",
      url: "/ping",
      handler: () => {
        res.end("ok");
      },
    });

    const res = await app.inject({ method: "GET", url: "/ping" });
    assert.equal(res.statusCode, 500);
    assert.strictEqual(JSON.parse(res.body).error, "Kaboom!");
  });

  it("should return a 500 error if async handler throw", async () => {
    app.route({
      method: "GET",
      url: "/ping",
      handler: async () => {
        throw new Error("Kaboom!");
      },
    });

    const res = await app.inject({ method: "GET", url: "/ping" });
    assert.equal(res.statusCode, 500);
    assert.strictEqual(JSON.parse(res.body).error, "Kaboom!");
  });
});
