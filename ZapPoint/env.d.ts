/// <reference types="vite/client" />

// Tell TypeScript that *.vue imports resolve to a Vue component. vue-tsc
// would normally synthesize this, but in `--build` mode with project
// references the shim must be explicit so .ts files (main.ts, router/index.ts)
// can import .vue modules.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
