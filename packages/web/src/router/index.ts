import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: process.env.NODE_ENV === 'development' ? '/admin' : '/home'
    },
    {
      path: '/home',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Home.vue')
    },
    {
      path: '/admin',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Query.vue'),
      meta: {
        layout: 'admin'
      }
    },
    {
      path: '/admin/edit',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Editor.vue'),
      meta: {
        layout: 'admin'
      }
    },
    {
      path: '/reveal',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Reveal.vue')
    }
  ]
})

export default router
