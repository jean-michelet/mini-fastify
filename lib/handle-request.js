import { kRouteContext } from "./symbols.js";

function sendError(reply, err) {
  reply.statusCode = 500;
    reply.end(
      JSON.stringify({
        error: err.message,
      })
    );
}

export async function handleRequest(err, request, reply) {
  if (err != null) {
    sendError(reply, err)
    return;
  }

  try {
    await request[kRouteContext].handler(request, reply);
  } catch (err) {
    sendError(reply, err)
  }
}
