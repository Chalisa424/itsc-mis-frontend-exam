import { createRouter, createWebHistory } from 'vue-router'
import BlogList from '../views/BlogList.vue'
import BlogCreate from '../views/BlogCreate.vue'
import BlogDetail from '../views/BlogDetail.vue'
import BlogUpdate from '../views/BlogUpdate.vue'

const router = createRouter ({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes:[
        {
            path: '/blogs',
            name:'BlogList',
            component: BlogList
        },
        {
            path: '/blogs/create',
            name:'BlogCreate',
            component: () => import ('../views/BlogCreate.vue')
        },
        {
            path:'/blogs/:id',
            name:'BlogDetail',
            component: BlogDetail
        },
        {
            path:'/blogs/:id/update',
            name:'BlogUpdate',
            component: BlogUpdate
        },
        {
            path:'/',
            redirect: '/blogs'
        }
    ]
})

export default router