import createError from "@fastify/error";

export const FST_ERR_INSTANCE_ALREADY_STARTED = createError(
  "FST_ERR_INSTANCE_ALREADY_STARTED",
  "Fastify instance is already started. %s"
);

export const FST_ERR_HOOK_NOT_SUPPORTED = createError(
  "FST_ERR_HOOK_NOT_SUPPORTED",
  "%s hook not supported!",
  500,
  TypeError
);

export const FST_ERR_PLUGIN_CALLBACK_NOT_FN = createError(
  'FST_ERR_PLUGIN_CALLBACK_NOT_FN',
  'fastify-plugin: %s',
  500,
  TypeError
)

export const FST_ERR_PLUGIN_NOT_VALID = createError(
  'FST_ERR_PLUGIN_NOT_VALID',
  'fastify-plugin: %s'
)

export const FST_ERR_ROOT_PLG_BOOTED = createError(
  'FST_ERR_ROOT_PLG_BOOTED',
  'fastify-plugin: %s'
)

export const FST_ERR_PARENT_PLUGIN_BOOTED = createError(
  'FST_ERR_PARENT_PLUGIN_BOOTED',
  'fastify-plugin: %s'
)

export const FST_ERR_PLUGIN_TIMEOUT = createError(
  'FST_ERR_PLUGIN_TIMEOUT',
  'fastify-plugin: %s'
)

export function appendStackTrace (oldErr, newErr) {
  newErr.cause = oldErr

  return newErr
}

export const AVVIO_ERRORS_MAP = {
  AVV_ERR_CALLBACK_NOT_FN: FST_ERR_PLUGIN_CALLBACK_NOT_FN,
  AVV_ERR_PLUGIN_NOT_VALID: FST_ERR_PLUGIN_NOT_VALID,
  AVV_ERR_ROOT_PLG_BOOTED: FST_ERR_ROOT_PLG_BOOTED,
  AVV_ERR_PARENT_PLG_LOADED: FST_ERR_PARENT_PLUGIN_BOOTED,
  AVV_ERR_READY_TIMEOUT: FST_ERR_PLUGIN_TIMEOUT,
  AVV_ERR_PLUGIN_EXEC_TIMEOUT: FST_ERR_PLUGIN_TIMEOUT
}