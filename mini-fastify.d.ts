import {
  InjectOptions,
  Response as LightMyRequestResponse,
} from "light-my-request";
import { RouteOptions } from "./types/routing";
import { HookHandlerMap, HookName } from "./types/hooks";

export type MiniFastifyPluginOptions = Record<string, any>;
export type MiniFastifyPlugin<T = MiniFastifyPluginOptions | undefined> = (
  instance: MiniFastifyInstance,
  options: T
) => void | Promise<void>;

export interface MiniFastifyInstance {
  ready(): Promise<MiniFastifyInstance>;
  close(): Promise<void>;
  onClose(fn: (instance: MiniFastifyInstance) => void | Promise<void>): this;

  register<T = MiniFastifyPluginOptions>(
    plugin: MiniFastifyPlugin<T>,
    options?: T
  ): void | Promise<void>;

  route(opts: RouteOptions): this;

  inject(opts: InjectOptions): Promise<LightMyRequestResponse>;

  addHook<K extends HookName>(name: K, fn: HookHandlerMap[K]): MiniFastifyInstance;
}

export interface FastifyServerOptions {
  pluginTimeout?: number
}

declare function miniFastify(opts?: FastifyServerOptions): MiniFastifyInstance;

export default miniFastify;
