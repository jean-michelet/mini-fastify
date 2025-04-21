
export type MiniFastifyPluginOptions = Record<string, any>
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
  ): void;
}

declare function miniFastify(): MiniFastifyInstance;

export default miniFastify;
