import request from '@/utils/request'

export function getMenu() {
  return request({
    url: '/menu/list',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/menu/add/',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/menu/edit/',
    method: 'post',
    data
  })
}

export function getAll() {
  return request({
    url: '/menu/getAll',
    method: 'get'
  })
}

export function remove(id) {
  return request({
    url: `/menu/remove/${id}`,
    method: 'post'
  })
}

export function getTree() {
  return request({
    url: '/menu/getTree',
    method: 'get'
  })
}
