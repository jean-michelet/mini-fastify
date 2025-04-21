// Avvio allows to load plugins within plugins while ensuring everything runs in the correct order.
// Once loading is complete, your application starts seamlessly.
import Avvio from "avvio";

import { kAvvioBoot, kState } from "./lib/symbols.js";

// pluginOverride *tells* Avvio how to deal with plugin encapsulation
import { pluginOverride } from "./lib/pluginOverride.js";

export default function miniFastify() {
  /**
   * The object returned to the user.
   * We deliberately keep it tiny; Avvio will “decorate” it in‑place with
   * `.register`, `.ready`, `.close`, etc.
   */
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
    onClose: null,
    close: null,

    // Will hold Avvio’s *real* `.ready()` so we can call it internally
    [kAvvioBoot]: null,
  };

  // Promise‑based wrapper around Avvio’s callback‑style `.ready()`.
  async function ready() {
    if (this[kState].readyPromise !== null) return this[kState].readyPromise;

    this[kState].readyPromise = new Promise((resolve, reject) => {
      instance[kAvvioBoot]((err, done) => {
        if (err) {
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

  return instance;
}
