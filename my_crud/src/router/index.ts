import { createRouter, createWebHistory } from 'vue-router'
import BlogList from '../views/BlogList.vue'
import BlogCreate from '../views/BlogCreate.vue'
import BlogDetail from '../views/BlogDetail.vue'
import BlogUpdate from '../views/BlogUpdate.vue'
import LoginView from '../views/LoginView.vue'

import { useAuthStore } from '../stores/AuthStore'
import { getAccessToken, isAccessTokenExpired } from '../services/tokenService'


const router = createRouter ({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes:[
        {
            path:'/login',
            name:'Login',
            component: LoginView
        },
        {
            path: '/blogs',
            name:'BlogList',
            component: BlogList,
            meta: { requiresAuth: true }
        },
        {
            path: '/blogs/create',
            name:'BlogCreate',
            component: BlogCreate,
            meta: { requiresAuth: true }
        },
        {
            path:'/blogs/:id',
            name:'BlogDetail',
            component: BlogDetail,
            meta: { requiresAuth: true }
        },
        {
            path:'/blogs/:id/update',
            name:'BlogUpdate',
            component: BlogUpdate,
            meta: { requiresAuth: true }
        },
        {
            path:'/',
            redirect: '/blogs'
        }
    ]
})

router.beforeEach(async(to) => {
    const auth =useAuthStore()

    if(!auth.user){
        await auth.restore().catch(() => {})
    }

    const needsAuth = to.matched.some((r) => r.meta?.requiresAuth)
    if (needsAuth) {
    if (!getAccessToken() || isAccessTokenExpired()) {
      return { path: '/login', query: { redirect: to.fullPath } }
        }
    }

    if (to.path === '/login' && getAccessToken() && !isAccessTokenExpired()) {
        return { path: '/blogs' }
    }
})

export default router