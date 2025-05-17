import FindMyWay from "find-my-way";
import { Context } from "./context.js";
import { kHooks, kRouteContext } from "./symbols.js";
import { lifecycleHooks, runHooks } from "./hooks.js";
import { handleRequest } from "./handle-request.js";

export function buildRouter() {
  const router = FindMyWay();

  let avvio
  // eslint-disable-next-line no-unused-vars
  function routeHandler (request, reply, params, context, query) {
    request[kRouteContext] = context
    // TODO: create at request initialization
    request.params = params
    if (context.onRequest !== null) {
      runHooks(
        context.onRequest,
        request,
        reply,
      ).then(() => handleRequest(null, request, reply))
       .catch((err) => handleRequest(err, request, reply))
    } else {
      handleRequest(null, request, reply)
    }
  }

  return {
    setup (options) {
      avvio = options.avvio
    },
    // Router function to find the right handler to call
    routing: router.lookup.bind(router),
    route(options) {
      // `constraints` let us register alternative routes for the same path 
      // e.g. by contraining host or version.
      const { method, url, handler, constraints } = options;
      const context = new Context({
        handler: handler.bind(this),
      });

      // onRoute hooks
      for (const hook of this[kHooks].onRoute) {
        hook.call(this, options)
      }

      this.after((notHandledErr, done) => {
        avvio.once('preReady', () => {
          for (const hook of lifecycleHooks) {
            const toSet = this[kHooks][hook]
              .map(h => h.bind(this))
            context[hook] = toSet.length > 0 ? toSet : null
          }
        })

        done(notHandledErr)
      })

      router.on(method, url, { constraints }, routeHandler, context);
    },
  };
}
