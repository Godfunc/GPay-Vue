import request from '@/utils/request'

export function page(page, limit, status, name, code) {
  return request({
    url: `/payCategory/page/${page}/${limit}`,
    method: 'get',
    params: { status, name, code }
  })
}

export function list() {
  return request({
    url: '/payCategory/list',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/payCategory/add',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: '/payCategory/edit',
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/payCategory/remove/${id}`,
    method: 'post'
  })
}
