// Avvio allows to load plugins within plugins while ensuring everything runs in the correct order.
// Once loading is complete, your application starts seamlessly.
import Avvio from "avvio";

// A set of unique constants enforced by Symbol (add explainations abotu what Symbol does).
import { kAvvioBoot, kState } from "./lib/symbols.js";
import { pluginOverride } from "./lib/pluginOverride.js";

export default function miniFastify() {
  // Public API
  const instance = {
    // instance internals
    [kState]: {
      started: false,
      ready: false,
      closing: false,
      readyPromise: null,
    },
    register: null, // Placeholder for a plugin registration function (to be overridden by Avvio).
    ready: null,
    onClose: null,
    close: null,
    [kAvvioBoot]: null,
  };

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

  // Initialize Avvio with the instance and configuration options.
  // Avvio will update the following instance methods:
  // - register
  // - ready
  // - onClose
  // - close
  const avvio = Avvio(instance, {
    autostart: false, // Do not start loading plugins automatically, but wait for a call to .start()  or .ready().
    timeout: 10_000, // Set timeout for plugin execution.
    expose: {
      use: "register", // Expose the Avvio native `use` method as `register` for plugin registration.
    },
  });

  // Override the Avvio's default override mechanism to handle plugin overrides.
  avvio.override = pluginOverride;
  avvio.on("start", () => {
    instance[kState].started = true;
  });

  // Here we differentiate boot by avvio vs miniFastify boot
  instance[kAvvioBoot] = instance.ready;
  instance.ready = ready;

  // cache the closing value, since we are checking it in an hot path
  avvio.once("preReady", () => {
    instance.onClose((instance, done) => {
      instance[kState].closing = true;
      done();
    });
  });

  // Return the instance, allowing users to register plugins and start the application.
  return instance;
}
