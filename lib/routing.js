import FindMyWay from "find-my-way";
import { Context } from "./context.js";

export function buildRouter() {
  const router = FindMyWay();

  return {
    // router func to find the right handler to call
    routing: router.lookup.bind(router),
    route(options) {
      // `constraints` lets us register alternative routes for the same path 
      // e.g. by contraining host or version.
      const { method, url, handler, constraints } = options;
      const context = new Context({
        handler: handler.bind(this),
      });

      router.on(method, url, { constraints }, handler, context);
    },
  };
}
