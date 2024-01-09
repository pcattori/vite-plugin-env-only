import * as babel from "@babel/core"
import { generate, parse, traverse, t, type NodePath } from "./babel"

import { name as pkgName } from "../package.json"
import { eliminateUnusedVariables } from "./eliminate-unused-variables"

const isMacro = (path: NodePath<t.CallExpression>, name: string) => {
  if (!t.isIdentifier(path.node.callee, { name })) return false
  let binding = path.scope.getBinding(name)
  if (!t.isImportDeclaration(binding?.path.parent)) return false
  if (binding.path.parent.source.value !== pkgName) return false
  if (path.node.arguments.length !== 1) {
    throw path.buildCodeFrameError(`'${name}' must take exactly one argument`)
  }
  return true
}

export const transform = (code: string, options: { ssr: boolean }): string => {
  let ast = parse(code, { sourceType: "module" })

  // Workaround for `path.buildCodeFrameError`
  // See:
  // - https://github.com/babel/babel/issues/11889
  // - https://github.com/babel/babel/issues/11350#issuecomment-606169054
  // @ts-expect-error `@types/babel__core` is missing types for `File`
  new babel.File({ filename: undefined }, { code, ast })

  traverse(ast, {
    CallExpression(path) {
      // env does not match
      // `macro$(expr)` -> `undefined`
      if (isMacro(path, options.ssr ? "client$" : "server$")) {
        path.replaceWith(t.identifier("undefined"))
      }
      // env matches
      // `macro$(expr)` -> `expr`
      if (isMacro(path, options.ssr ? "server$" : "client$")) {
        let arg = path.node.arguments[0]
        if (t.isExpression(arg)) {
          path.replaceWith(arg)
        }
      }
    },
  })
  eliminateUnusedVariables(ast)
  return generate(ast).code
}
