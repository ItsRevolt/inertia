<script context="module" lang="ts">
  import type { PageProps } from '@inertiajs/core'
  import type { InertiaComponentType } from '../types'

  type RenderProps = {
    component: InertiaComponentType
    props?: PageProps
    children?: RenderProps[]
  } | null

  export const h = (component: InertiaComponentType, props?: PageProps, children?: RenderProps[]): RenderProps => {
    return {
      component,
      ...(props ? { props } : {}),
      ...(children ? { children } : {}),
    }
  }
</script>

<script lang="ts">
  import store from '../store'

  export let component: InertiaComponentType
  export let props: PageProps = {}
  export let children: RenderProps[] = []
</script>

{#if $store.component}
  {#key children?.length === 0 ? $store.key : null}
    <svelte:component this={component} {...props}>
      {#each children as child}
        <svelte:self {...child} />
      {/each}
    </svelte:component>
  {/key}
{/if}
