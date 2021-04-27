import { constantRoutes } from '@/router'
import { getMenu } from '@/api/menu'
import Layout from '@/layout'

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

function createMenu(item) {
  return {
    path: item.path,
    // component: item.component === 'Layout' ? Layout : () => import(`@/views/${item.component}`), // Layout  () => import('@/views/nested/menu1/menu1-1')
    // fix Error: Cannot find module '@/views/xxx/xxx'
    component: item.component === 'Layout' ? Layout : (resolve) => require([`@/views/${item.component}`], resolve),
    redirect: item.redirect,
    name: item.name,
    alwaysShow: item.alwaysShow, // 只有一个子菜单时是否还显示根菜单
    meta: {
      title: item.title,
      icon: item.icon,
      breadcrumb: item.breadcrumb
    }
  }
}

function eachMenu(data, temp = []) {
  for (var i = 0; i < data.length; i++) {
    const item = data[i]
    let menu = createMenu(item)
    if (item.children && item.children.length > 0) {
      menu.children = []
      menu = doMenu(item, menu)
    }
    temp.push(menu)
  }
  return temp
}

function doMenu(data, menu) {
  for (var i = 0; i < data.children.length; i++) {
    const item = data.children[i]
    let cmenu = createMenu(item)
    if (item.children && item.children.length > 0) {
      cmenu.children = []
      cmenu = doMenu(item, cmenu)
    }
    menu.children.push(cmenu)
  }
  return menu
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise((resolve, reject) => {
      getMenu().then(response => {
        if (!response) {
          reject('网络异常，请稍后再试')
        }
        let accessedRoutes = []
        if (response.data && response.data.length > 0) {
          accessedRoutes = eachMenu(response.data)
        }
        accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
