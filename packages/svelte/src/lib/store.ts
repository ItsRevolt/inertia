import type { Page } from '@inertiajs/core'
import { writable } from 'svelte/store'

const store = writable<Page | {}>({})

export default store
