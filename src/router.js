import { createRouter, createWebHistory } from 'vue-router';
import DefaultView from './views/DefaultView.vue';
import DetailView from './views/DetailView.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: DefaultView
    },
    {
        path: '/detail/:data',
        name: 'detail',
        component: DetailView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;