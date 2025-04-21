import { expectType, expectError } from "tsd";
import miniFastify, {
  MiniFastifyInstance,
  MiniFastifyPluginOptions,
} from "../../mini-fastify.js";

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

app.register(async (instance: MiniFastifyInstance, opts) => {});

expectError(app.register((instance, opts) => {
    opts.x = true
}, { x: 1 }));
