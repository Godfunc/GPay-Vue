import request from '@/utils/request'

export function page(page, limit, name) {
  return request({
    url: `/role/page/${page}/${limit}`,
    method: 'get',
    params: { name }
  })
}

export function remove(id) {
  return request({
    url: `/role/remove/${id}`,
    method: 'post'
  })
}

export function edit(data) {
  return request({
    url: '/role/edit',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: '/role/add',
    method: 'post',
    data
  })
}

export function getMenus(id) {
  return request({
    url: `/role/getMenus/${id}`,
    method: 'get'
  })
}

export function list() {
  return request({
    url: '/role/list',
    method: 'get'
  })
}

export function getByUser(userId) {
  return request({
    url: `/role/getByUser/${userId}`,
    method: 'get'
  })
}
