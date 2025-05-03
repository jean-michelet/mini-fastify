import { expectType, expectError } from "tsd";
import {
  InjectOptions,
  Response as LightMyRequestResponse,
} from "light-my-request";
import miniFastify, {
  MiniFastifyInstance,
  MiniFastifyPluginOptions,
} from "../../mini-fastify.js";
import { IncomingMessage, ServerResponse } from "node:http";

// basic instance
const app = miniFastify();
expectType<MiniFastifyInstance>(app);

// lifecycle methods
expectType<Promise<MiniFastifyInstance>>(app.ready());
expectType<Promise<void>>(app.close());
expectType<MiniFastifyInstance>(app.onClose(async () => {}));

// register
app.register((instance) => {
  expectType<MiniFastifyInstance>(instance);
});

app.register((instance, opts) => {
  expectType<MiniFastifyInstance>(instance);
  expectType<MiniFastifyPluginOptions>(opts);
});

app.register(
  (instance, opts) => {
    expectType<MiniFastifyInstance>(instance);
    expectType<{ hello: string }>(opts);
  },
  { hello: "world" }
);

expectType<MiniFastifyInstance>(
  app.route({
    method: "GET",
    url: "/",
    handler: (req, res) => {
      expectType<IncomingMessage>(req)
      expectType<ServerResponse>(res)
      res.end("ok");
    },
    constraints: { host: "hello" },
  })
);

// Missing handler
expectError(app.route({ method: "GET", url: "/" }));

// Invalid constraints
expectError(app.route({ method: "GET", url: "/", handler: () => {}, constraints: true }));

const opts: InjectOptions = {};
expectType<Promise<LightMyRequestResponse>>(app.inject(opts));

expectError(
  app.register(
    (instance, opts) => {
      opts.x = true;
    },
    { x: 1 }
  )
);

expectError<MiniFastifyInstance>(
  app.addHook("invalidHook", () => {})
);

expectType<MiniFastifyInstance>(
  app.addHook("onRequest", (req, rep) => {
    expectType<IncomingMessage>(req)
    expectType<ServerResponse>(rep)
  })
);