// Object that holds the context of every request
// Every route holds an instance of this object.
export class Context {
  constructor({ handler }) {
    this.handler = handler;
    this.onRequest = null;
    this.onSend = null;
    this.onError = null;
    this.onTimeout = null;
    this.preHandler = null;
    this.onResponse = null;
    this.preSerialization = null;
    this.onRequestAbort = null;
  }
}
