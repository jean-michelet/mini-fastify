// Avvio allows to load plugins within plugins while ensuring everything runs in the correct order.
// Once loading is complete, your application starts seamlessly.
import Avvio from "avvio";

import { kAvvioBoot, kHooks, kState } from "./lib/symbols.js";

// pluginOverride *tells* Avvio how to deal with plugin encapsulation
import { pluginOverride } from "./lib/pluginOverride.js";
import { buildRouter } from "./lib/routing.js";
import { hookRunnerApplication, Hooks } from "./lib/hooks.js";
import {
  appendStackTrace,
  AVVIO_ERRORS_MAP,
  FST_ERR_INSTANCE_ALREADY_STARTED,
} from "./lib/errors.js";

export default function miniFastify(options = {}) {
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
      booting: false,
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
      throwIfAlreadyStarted('Cannot call "route"!');
      // we need the miniFastify object that we are producing so we apply a lazy loading of the function,
      // otherwise we should bind it after the declaration
      return router.route.call(this, options);
    },

    inject,

    [kHooks]: new Hooks(),
    addHook,
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
  function ready() {
    if (this[kState].readyPromise !== null) {
      return this[kState].readyPromise;
    }

    let resolveReady;
    let rejectReady;

    // run the onReady hooks after returning the promise
    process.nextTick(runOnReadyHooks);

    this[kState].readyPromise = new Promise((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });

    return this[kState].readyPromise;

    function runOnReadyHooks() {
      // Internal avvio `ready` function
      instance[kAvvioBoot]((err, done) => {
        if (err) {
          readyDone(err);
        } else {
          instance[kState].booting = true;
          hookRunnerApplication(
            "onReady",
            instance[kAvvioBoot],
            instance,
            readyDone
          );
        }

        done();
      });
    }

    function readyDone(err) {
      // If the error comes out of Avvio's Error codes
      // We create a make and preserve the previous error
      // as cause
      err =
        err != null && AVVIO_ERRORS_MAP[err.code] != null
          ? appendStackTrace(err, new AVVIO_ERRORS_MAP[err.code](err.message))
          : err;

      if (err) {
        return rejectReady(err);
      }

      resolveReady(instance);
      instance[kState].booting = false;
      instance[kState].ready = true;
      instance[kState].readyPromise = null;
    }
  }

  /**
   * Initialise Avvio **after** defining `instance` so Avvio can mutate it
   * (adding `.register`, `.ready`, etc.).  We disable `autostart` so boot
   * happens *only* when the user calls `instance.ready()`.
   */
  const avvioPluginTimeout = Number(options.pluginTimeout);
  const avvio = Avvio(instance, {
    autostart: false, // Do not start loading plugins automatically, but wait for a call to .start()  or .ready().
    // TODO: Validation builder instead of default hardcoded value
    timeout: isNaN(avvioPluginTimeout) === false ? avvioPluginTimeout : 10_000, // Set timeout for plugin execution.
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

  function throwIfAlreadyStarted(msg) {
    if (instance[kState].started)
      throw new FST_ERR_INSTANCE_ALREADY_STARTED(msg);
  }

  router.setup({
    avvio,
  });

  function addHook(name, fn) {
    throwIfAlreadyStarted('Cannot call "addHook"!');
    if (name === "onClose") {
      this.onClose(fn.bind(this));
    } else if (
      name === "onReady" ||
      name === "onRoute" ||
      name === "onListen"
    ) {
      this[kHooks].add(name, fn);
    } else {
      this.after((err, done) => {
        console.log("I called even if .ready was never called");
        try {
          _addHook.call(this, name, fn);
          done(err);
        } catch (err) {
          done(err);
        }
      });
    }

    return this;

    function _addHook(name, fn) {
      this[kHooks].add(name, fn);
      // TODO:
      // this[kChildren].forEach(child => _addHook.call(child, name, fn))
    }
  }

  return instance;
}
