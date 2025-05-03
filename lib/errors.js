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
