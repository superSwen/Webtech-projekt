import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DetailsView from '@/views/DetailsView.vue'

import { LoginCallback, navigationGuard } from '@okta/okta-vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ✅ Okta will redirect here after login
    { path: '/login/callback', component: LoginCallback },

    // ✅ Protect your app routes
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },

    {
      path: '/details/:kind/:id',
      name: 'details',
      component: DetailsView,
      props: true,
      meta: { requiresAuth: true }
    }
  ]
})

// ✅ This enforces login for routes with meta.requiresAuth
router.beforeEach(navigationGuard)

export default router
