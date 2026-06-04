import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/components/LoginPage.vue'

const routes = [

  // ══════════════════════════════════════════
  // ★ 不需要登录的页面：不加 meta，或 meta: { requireAuth: false }
  // ══════════════════════════════════════════

  {
    path: '/',
    redirect: '/login'   // 根路径直接跳转到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
    // 登录页，不需要登录，不加 meta
  },
  {
    path: '/register',
    name: 'Register',
    component: LoginPage
    // 注册页，不需要登录，不加 meta
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomePage.vue')
    // 首页，不需要登录，不加 meta
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { requireAuth: true }   // ← 需要登录
 
  },
  {
    path: '/product/:id',
    name: 'Product',
    component: () => import('@/views/Product.vue'),
    meta: { requireAuth: true }
  },

  // ══════════════════════════════════════════
  // ★ 需要登录的页面：加上 meta: { requireAuth: true }
  //   没有登录会自动跳转到登录页
  // ══════════════════════════════════════════

  {
    path: '/my',
    name: 'My',
    component: () => import('@/views/My.vue'),
    meta: { requireAuth: true }   // ← 需要登录
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { requireAuth: true }   // ← 需要登录
  },
  {
    path: '/pay',
    name: 'Pay',
    component: () => import('@/views/Pay.vue'),
    meta: { requireAuth: true }   // ← 需要登录
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('@/views/MessagePage.vue'),
    meta: { requireAuth: true }   // ← 需要登录
  },
  {
    path: '/ai',
    name: 'AiAssistant',
    component: () => import('@/views/AiAssistant.vue'),
    meta: { requireAuth: true }   // ← 需要登录
  },
  {
    path: '/coupon',
    name: 'Coupon',
    component: () => import('@/views/Coupon.vue'),
    meta: { requireAuth: true }   // ← 需要登录
  },
  {
    path: '/shop/:id',
    name: 'Shop',
    component: () => import('@/views/Shop.vue'),
    meta: { requireAuth: true }   // ← 需要登录
  },

  // ══════════════════════════════════════════
  // ★ 后期新增页面参考：
  //   不需要登录 → 直接写路由，不加 meta
  //   需要登录   → 加上 meta: { requireAuth: true }
  // ══════════════════════════════════════════

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ══════════════════════════════════════════
// 路由守卫：自动检查是否需要登录
// 这里不需要修改，加了 meta: { requireAuth: true } 的页面会自动被拦截
// ══════════════════════════════════════════
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requireAuth && !token) {
    // 需要登录但没有 token → 跳转登录页，并记住原来想去哪
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    // 不需要登录，或者已经登录了 → 直接放行
    next()
  }
})

export default router