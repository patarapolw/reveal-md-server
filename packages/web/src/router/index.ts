import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const registeredLayouts = [
  'Admin'
]

registeredLayouts.map((layout) => {
  Vue.component(`${layout}Layout`, () => import(/* webpackChunkName: "[request]-layout" */ `../layouts/${layout}.vue`))
})

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: process.env.NODE_ENV === 'development' ? '/admin' : '/blank'
    },
    {
      path: '/home',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Home.vue')
    },
    {
      path: '/reveal',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Reveal.vue')
    },
    {
      path: '/reveal/:slug',
      component: () => import(/* webpackChunkName: "[request]" */ '../views/Reveal.vue')
    },
    ...(process.env.NODE_ENV === 'development' ? [
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
      }
    ] : [])
  ]
})

export default router
