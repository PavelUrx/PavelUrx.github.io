import { createRouter, createWebHistory } from 'vue-router';
import DefaultView from './views/DefaultView.vue';
import ProjectView from './views/ProjectView.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: DefaultView
    },
    {
        path: '/project/:data',
        name: 'project',
        component: ProjectView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;