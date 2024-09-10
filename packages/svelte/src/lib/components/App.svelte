<script lang="ts">
  import type { Page, PageProps } from '@inertiajs/core'
  import Render, { h } from './Render.svelte'
  import type { RenderProps } from './Render.svelte'
  import type { ResolvedComponent } from './../types'

  export let component: ResolvedComponent
  export let page: Page<PageProps>
  export let key: string | null

  $: components = resolveComponents(component, page, key)
  
  function resolveComponents(component: ResolvedComponent, page: Page<PageProps>, key: string | null): RenderProps {
    const child = h(component.default, page.props, [], key)
    const layout = component.layout

    return layout
      ? Array.isArray(layout)
        ? layout            // [OuterLayout, InnerLayout]
            .concat(child)  // [OuterLayout, InnerLayout, PageComponent]
            .reverse()      // [PageComponent, InnerLayout, OuterLayout]
            .reduce((child, layout) => h(layout, page.props, [child], key))
                            // {
                            //   component: OuterLayout,
                            //   children: [{
                            //     component: InnerLayout,
                            //     children: [{
                            //       component: PageComponent,
                            //       children: [],
                            //     }],
                            //   }],
                            // }
        : h(layout, page.props, child ? [child] : [], key)
      : child
  }
</script>

<Render {...components} />
