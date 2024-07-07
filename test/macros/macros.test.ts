import path from "node:path"

import * as vite from "vite"
import { describe, test, expect } from "vitest"

import { envOnlyMacros } from "../../src"

describe("macros", () => {
  const root = __dirname

  const config = ({
    ssr,
    outDir,
  }: {
    ssr: boolean
    outDir: string
  }): vite.InlineConfig => ({
    root,
    logLevel: "silent",
    build: {
      ssr,
      minify: false,
      lib: {
        entry: "lib/main.js",
        formats: ["es"],
      },
      rollupOptions: {
        output: {
          dir: outDir,
          entryFileNames: "index.js",
        },
      },
    },
    plugins: [envOnlyMacros()],
  })

  test("serverOnly$", async () => {
    const outDir = path.join(root, "dist/server")
    await vite.build(config({ ssr: true, outDir }))

    expect((await import(outDir)).default).toEqual({
      server: true,
      client: false,
    })
  })

  test("clientOnly$", async () => {
    const outDir = path.join(root, "dist/client")
    await vite.build(config({ ssr: false, outDir }))

    expect((await import(outDir)).default).toEqual({
      server: false,
      client: true,
    })
  })
})
