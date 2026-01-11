import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MediaDetailView from '@/views/MediaDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },

    // Bonus: Detail (Title klickbar)
    { path: '/:kind(films|series)/:id', name: 'mediaDetail', component: MediaDetailView },

    // Alias-Routen (falls du lieber getrennte Namen willst)
    { path: '/films/:id', name: 'filmDetail', component: MediaDetailView, props: (r) => ({ ...r.params, kind: 'films' }) },
    { path: '/series/:id', name: 'serieDetail', component: MediaDetailView, props: (r) => ({ ...r.params, kind: 'series' }) },
  ]
})

export default router
