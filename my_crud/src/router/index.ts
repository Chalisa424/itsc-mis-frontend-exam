import { createRouter, createWebHistory } from 'vue-router'
import BlogList from '../view/BlogList.vue'
import BlogCreate from '../view/BlogCreate.vue'
import BlogDetail from '../view/BlogDetail.vue'
import BlogUpdate from '../view/BlogUpdate.vue'

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
            component: BlogCreate
        },
        {
            path:'/blogs/:id',
            name:'BlogDetail',
            component: BlogDetail
        },
        {
            path:'blogs/:id/update',
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