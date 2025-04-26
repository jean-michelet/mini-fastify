// Object that holds the context of every request
// Every route holds an instance of this object.
export class Context {
  constructor({ handler }) {
    this.handler = handler;
  }
}
