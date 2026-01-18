import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tailwind.css'

import OktaVue from '@okta/okta-vue'
import { oktaAuth } from '@/utils/okta'

createApp(App).use(router).use(OktaVue, { oktaAuth }).mount('#app')

