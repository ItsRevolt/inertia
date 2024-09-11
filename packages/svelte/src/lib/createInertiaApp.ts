import { router, setupProgress, type InertiaAppResponse, type Page, type PageProps } from '@inertiajs/core'
import type { ComponentType, SvelteComponent } from 'svelte'
import App from './components/App.svelte'
import SSR, { type SSRProps } from './components/SSR.svelte'
import store from './store'
import type { ComponentResolver, ResolvedComponent } from './types'

interface InertiaAppComponentType extends ComponentType<App>, SvelteComponent {}
type SvelteRenderResult = { html: string; head: string; css: { code: string } }
type SSRComponent = ComponentType<SSR> & { render: (props: SSRProps) => SvelteRenderResult }

interface CreateInertiaAppProps {
  id?: string
  resolve: ComponentResolver
  setup: (props: {
    el: Element
    App: ComponentType<App>
    props: {
      component: ResolvedComponent
      page: Page<PageProps>
      key: string | null
    }
  }) => InertiaAppComponentType
  progress?:
    | false
    | {
        delay?: number
        color?: string
        includeCSS?: boolean
        showSpinner?: boolean
      }
  page?: Page
}

export default async function createInertiaApp({
  id = 'app',
  resolve,
  setup,
  progress = {},
  page,
}: CreateInertiaAppProps): InertiaAppResponse {
  const isServer = typeof window === 'undefined'
  const el = isServer ? null : document.getElementById(id)
  const initialPage: Page = page || JSON.parse(el?.dataset?.page || '{}')
  const resolveComponent = (name: string) => Promise.resolve(resolve(name))
  let appComponent: InertiaAppComponentType
  let initialComponent: ResolvedComponent
  let key: number | null = null

  await resolveComponent(initialPage.component).then((component: ResolvedComponent) => {
    initialComponent = component
    store.set(initialPage)
  })

  if (isServer) {
    const { html, head, css } = (SSR as SSRComponent).render({ id, initialPage })

    return {
      body: html,
      head: [head, `<style data-vite-css>${css.code}</style>`],
    }
  }

  if (!el) {
    throw new Error(`Element with ID "${id}" not found.`)
  }

  router.init({
    initialPage,
    resolveComponent,
    swapComponent: async (props) => {
      const oldOrNewKey = props.preserveState ? key : Date.now()

      if (appComponent) {
        key = oldOrNewKey
        appComponent.$set({ ...props, key })
      }

      store.set(props.page)
    },
  })

  if (progress) {
    setupProgress(progress)
  }

  appComponent = setup({
    el,
    App,
    props: {
      component: initialComponent,
      page: initialPage,
      key,
    },
  })
}
