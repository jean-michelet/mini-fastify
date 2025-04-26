import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import miniFastify from "../mini-fastify.js";

describe("miniFastify routing", () => {
  let app;

  beforeEach(() => {
    app = miniFastify();
  });

  it("should reply with the payload of a registered route", async () => {
    app.route({
      method: "GET",
      url: "/ping",
      handler: (_req, res) => {
        res.end("pong");
      },
    });

    const res = await app.inject({ method: "GET", url: "/ping" });
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload, "pong");
  });

  it("should return 404 for an unknown route", async () => {
    const res = await app.inject({ method: "GET", url: "/missing" });
    assert.equal(res.statusCode, 404);
  });

  it("should pass path parameters to the handler", async () => {
    app.route({
      method: "GET",
      url: "/user/:id",
      handler: (_req, res, params) => {
        res.end(params.id);
      },
    });

    const res = await app.inject({ method: "GET", url: "/user/42" });
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload, "42");
  });

  it("should differentiate methods for the same path", async () => {
    const config = { method: "POST", url: "/resource" };
    app.route({
      ...config,
      handler: (_req, res) => res.end("created"),
    });

    const ok = await app.inject(config);
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.payload, "created");

    const nope = await app.inject({ ...config, method: "GET" });
    assert.equal(nope.statusCode, 404);
  });
});
