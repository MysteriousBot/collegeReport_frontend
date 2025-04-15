import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CollegeView from '../views/CollegeView.vue'
import TestView from '../views/TestView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/colleges',
    name: 'colleges',
    component: CollegeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/test',
    name: 'test',
    component: TestView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to home if trying to access protected route while not logged in
    next('/');
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to colleges if user is already logged in and tries to access login
    next('/colleges');
  } else {
    next();
  }
});

export default router
