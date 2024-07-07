import { name as pkgName } from "../package.json"

declare global {
  interface ImportMeta {
    env?: unknown
  }
}

const usingVite =
  import.meta.env &&
  typeof import.meta.env === "object" &&
  "MODE" in import.meta.env &&
  "BASE_URL" in import.meta.env &&
  "PROD" in import.meta.env &&
  "DEV" in import.meta.env &&
  "SSR" in import.meta.env

const maybe = <T>(value: T): T | undefined => {
  if (!usingVite) return value
  throw Error(
    [
      `${pkgName}: unreplaced macro`,
      "",
      `Did you forget to add the 'envOnlyMacros' plugin from '${pkgName}' to your Vite config?`,
      "👉 https://github.com/pcattori/vite-env-only#macros",
    ].join("\n")
  )
}

/**
 * On the server, replaced with the value passed in.
 * On the client, replaced with `undefined`.
 */
export const serverOnly$ = maybe

/**
 * On the client, replaced with the value passed in.
 * On the server, replaced with `undefined`.
 */
export const clientOnly$ = maybe
