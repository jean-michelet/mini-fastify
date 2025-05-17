import { IncomingMessage, ServerResponse } from "http";
import { MiniFastifyInstance } from "../mini-fastify";
import { RouteOptions } from "./routing";

export interface HookHandlerMap {
  onRequest: (
    request: IncomingMessage,
    reply: ServerResponse
  ) => void | Promise<void>;
  preParsing: (
    request: IncomingMessage,
    reply: ServerResponse,
    payload: any
  ) => any;
  preValidation: (
    request: IncomingMessage,
    reply: ServerResponse
  ) => void | Promise<void>;
  preHandler: (
    request: IncomingMessage,
    reply: ServerResponse
  ) => void | Promise<void>;
  preSerialization: (
    request: IncomingMessage,
    reply: ServerResponse,
    payload: any
  ) => any;
  onSend: (request: IncomingMessage, reply: ServerResponse, payload: any) => any;
  onResponse: (
    request: IncomingMessage,
    reply: ServerResponse
  ) => void | Promise<void>;
  onError: (
    error: Error,
    request: IncomingMessage,
    reply: ServerResponse
  ) => void | Promise<void>;
  onTimeout: (
    request: IncomingMessage,
    reply: ServerResponse
  ) => void | Promise<void>;
  onRequestAbort: (
    request: IncomingMessage,
    reply: ServerResponse
  ) => void | Promise<void>;

  // application lifecycle
  onRoute: (routeOptions: RouteOptions) => void;
  onRegister: (instance: MiniFastifyInstance, opts: any) => void;
  onReady: (done: () => void) => void;
  onListen: (server: MiniFastifyInstance, address: any) => void;
  preClose: (instance: MiniFastifyInstance, done: () => void) => void;
  onClose: (instance: MiniFastifyInstance, done: () => void) => void;
}

export type HookName = keyof HookHandlerMap;