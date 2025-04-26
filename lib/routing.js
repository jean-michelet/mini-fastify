import FindMyWay from "find-my-way";
import { Context } from "./context.js";

export function buildRouter() {
  const router = FindMyWay();

  return {
    // router func to find the right handler to call
    routing: router.lookup.bind(router),
    route(options) {
      const { method, url, handler, constraints } = options;
      const context = new Context({
        handler: handler.bind(this),
      });

      router.on(method, url, { constraints }, handler, context);
    },
  };
}
