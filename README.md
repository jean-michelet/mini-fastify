# 🧠 mini-fastify (WIP)

A work-in-progress educational reimplementation of Fastify's core concepts.

The goal is to:

- Demystify the internal architecture of Fastify
- Introduce key libraries like `avvio` and `find-my-way`
- Explore computer science and Node.js/JavaScript advanced concepts.

This is not a production-ready web framework, but a learning tool designed for experienced developers and potential contributors who want to understand how things really work under the hood.

Done:
- App life cycle (no-hooks) and plugin system with avvio (register, encapsulation)
- Routing with find-my-way
- Inject with light-my-request
- Internal Errors
- Hooks basis

Next steps are:
- Request
- Reply
- Decorators
- Validation and Serialization
- Server

Exercices:
- Allow to configure mini-fastify: `miniFastify(serverOptions)`
- Add error and notFound handlers