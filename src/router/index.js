import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/my',
    name: 'My',
    component: ()=>import('@/views/My.vue')
  },
    {
    path: '/cart',
    name: 'Cart',
    component: ()=>import('@/views/Cart.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router