// Avvio allows to load plugins within plugins while ensuring everything runs in the correct order.
// Once loading is complete, your application starts seamlessly.
import Avvio from "avvio";

import { kAvvioBoot, kHooks, kState } from "./lib/symbols.js";

// pluginOverride *tells* Avvio how to deal with plugin encapsulation
import { pluginOverride } from "./lib/pluginOverride.js";
import { buildRouter } from "./lib/routing.js";
import { Hooks } from "./lib/hooks.js";
import { FST_ERR_INSTANCE_ALREADY_STARTED } from "./lib/errors.js";

export default function miniFastify() {
  const router = buildRouter();
  const instance = {
    /**
     * Internal lifecycle flags.
     *   started      – set when Avvio emits `"start"`.
     *   ready        – set *after* our own wrapper resolves.
     *   closing      – set in a pre‑registered `onClose` hook.
     *   readyPromise – memoises the Promise returned by `instance.ready()`
     *                  so repeated calls are idempotent.
     */
    [kState]: {
      started: false,
      ready: false,
      closing: false,
      readyPromise: null,
    },

    // Place‑holders (to be replaced by Avvio)
    register: null,
    ready: null,
    after: null,
    onClose: null,
    close: null,

    // Will hold Avvio’s *real* `.ready()` so we can call it internally
    [kAvvioBoot]: null,
    route: function _route(options) {
      throwIfAlreadyStarted('Cannot call "route"!')
      // we need the fastify object that we are producing so we apply a lazy loading of the function,
      // otherwise we should bind it after the declaration
      return router.route.call(this, options);
    },

    inject,

    [kHooks]: new Hooks(),
    addHook
  };

  let lightMyRequest;
  async function inject(opts) {
    // lightMyRequest is dynamically loaded as it seems 
    // very expensive because of Ajv
    if (lightMyRequest === undefined) {
      lightMyRequest = (await import("light-my-request")).default;
    }

    return lightMyRequest(async (req, res) => {
      await instance.ready();

      await router.routing(req, res);
    }, opts);
  }

  // Promise‑based wrapper around Avvio’s callback‑style `.ready()`.
  async function ready() {
    if (this[kState].readyPromise !== null) return this[kState].readyPromise;

    this[kState].readyPromise = new Promise((resolve, reject) => {
      // Internal avvio `ready` function
      instance[kAvvioBoot]((err, done) => {
        if (err) {
          console.log("hi")
          reject(err);
        } else {
          instance[kState].ready = true;
          resolve(instance);
        }

        done();
      });
    });

    return this[kState].readyPromise;
  }

  /**
   * Initialise Avvio **after** defining `instance` so Avvio can mutate it
   * (adding `.register`, `.ready`, etc.).  We disable `autostart` so boot
   * happens *only* when the user calls `instance.ready()`.
   */
  const avvio = Avvio(instance, {
    autostart: false, // Do not start loading plugins automatically, but wait for a call to .start()  or .ready().
    timeout: 10_000, // Set timeout for plugin execution.
    expose: {
      use: "register", // make Avvio’s .use() available as .register()
    },
  });

  // Tell Avvio to use our custom encapsulation rules.
  avvio.override = pluginOverride;
  avvio.on("start", () => {
    instance[kState].started = true;
  });

  /**
   * Swap the boot functions:
   *   • Save Avvio’s original ready in kAvvioBoot for internal use
   *   • Replace instance.ready with our Promise wrapper (public api)
   */
  instance[kAvvioBoot] = instance.ready;
  instance.ready = ready;

  /**
   * Mark `closing = true` in the *very first* onClose hook we add.
   * preReady guarantees the hook is registered long before
   * users can call `instance.close()`.
   */
  avvio.once("preReady", () => {
    instance.onClose((instance, done) => {
      instance[kState].closing = true;
      done();
    });
  });

  function addHook (name, fn) {
    throwIfAlreadyStarted('Cannot call "addHook"!')

    this.after((err, done) => {
      try {
        _addHook.call(this, name, fn)
        done(err)
      } catch (err) {
        done(err)
      }
    })

    function _addHook (name, fn) {
      this[kHooks].add(name, fn)
      // Todo:
      // this[kChildren].forEach(child => _addHook.call(child, name, fn))
    }

    return this;
  };

  function throwIfAlreadyStarted (msg) {
    if (instance[kState].started) throw new FST_ERR_INSTANCE_ALREADY_STARTED(msg)
  }

  router.setup({
    avvio 
  })

  return instance;
}
