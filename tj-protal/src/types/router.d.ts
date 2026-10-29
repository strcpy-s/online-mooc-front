import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    active?: string
    hidden?: boolean
    current?: string
    parent?: string
  }
}
