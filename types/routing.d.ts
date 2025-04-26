import { IncomingMessage, ServerResponse } from "node:http";

export interface RouteConstraint {
  version?: string;
  host?: RegExp | string;
  [name: string]: unknown;
}

export type RouteHandler = (request: IncomingMessage, reply: ServerResponse) => unknown

export interface RouteOptions {
  method: string;
  url: string;
  handler: RouteHandler
  constraints?: RouteConstraint;
}
