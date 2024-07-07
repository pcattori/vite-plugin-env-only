---
"vite-env-only": patch
---

Macros should not throw when running outside of Vite

The `envOnlyMacros` plugin handles `vite-env-only`'s `serverOnly$` and `clientOnly$` macros
at compile-time, guaranteeing that we never leak code to the wrong bundle.
These compile-time guarantees are provided by AST transforms, not by the runtime
errors thrown by the unreplaced macros.
Those errors only exist to aid in the debugging process for users already using Vite.

For users who want to directly run code outside of Vite that contains `vite-env-only` macros,
the macros should be no-ops / identity functions.
That way code can be shared across your app and your scripts while still letting you explicitly mark code as server-only or client-only at the definition site, not the call site.
