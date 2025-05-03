import { FST_ERR_HOOK_NOT_SUPPORTED } from "./errors.js";

export const applicationHooks = [
  "onRoute",
  "onRegister",
  "onReady",
  "onListen",
  "preClose",
  "onClose",
];

export const lifecycleHooks = [
  "onTimeout",
  "onRequest",
  "preParsing",
  "preValidation",
  "preSerialization",
  "preHandler",
  "onSend",
  "onResponse",
  "onError",
  "onRequestAbort",
];

export class Hooks {
  constructor() {
    this.onRequest = [];
    this.preParsing = [];
    this.preValidation = [];
    this.preSerialization = [];
    this.preHandler = [];
    this.onResponse = [];
    this.onSend = [];
    this.onError = [];
    this.onRoute = [];
    this.onRegister = [];
    this.onReady = [];
    this.onListen = [];
    this.onTimeout = [];
    this.onRequestAbort = [];
    this.preClose = [];
  }

  add(hook, fn) {
    if (Array.isArray(this[hook]) === false) {
      throw new FST_ERR_HOOK_NOT_SUPPORTED(hook);
    }

    this[hook].push(fn);
  }
}

export function buildHooks(h) {
  const hooks = new Hooks();
  hooks.onRequest = [...h.onRequest];
  hooks.preParsing = [...h.preParsing];
  hooks.preValidation = [...h.preValidation];
  hooks.preSerialization = [...h.preSerialization];
  hooks.preHandler = [...h.preHandler];
  hooks.onSend = [...h.onSend];
  hooks.onResponse = [...h.onResponse];
  hooks.onError = [...h.onError];
  hooks.onRoute = [...h.onRoute];
  hooks.onRegister = [...h.onRegister];
  hooks.onTimeout = [...h.onTimeout];
  hooks.onRequestAbort = [...h.onRequestAbort];
  hooks.onReady = [];
  hooks.onListen = [];
  hooks.preClose = [];
  return hooks;
}

export async function runHooks(hooks, request, reply) {
  for (let i = 0; i < hooks.length; i++) {
    const hook = hooks[i];
    await hook(request, reply);
  }
}
